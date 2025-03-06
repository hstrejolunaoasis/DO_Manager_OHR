'use client'
import { useState, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  CloudArrowUpIcon,
  FolderIcon,
  DocumentIcon,
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import { SearchBar } from './ui/SearchBar'
import { ViewSelector } from './ui/ViewSelector'
import { FilePreview } from './ui/FilePreview'

interface FileObject {
  Key: string
  LastModified: Date
  Size: number
  Type: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Failed to fetch data')
  }
  return res.json()
}

export default function FileManager() {
  const [currentPath, setCurrentPath] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  
  const { data: files, error, mutate } = useSWR<FileObject[]>(
    `/api/files${currentPath ? `?prefix=${currentPath}` : ''}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`,
    fetcher,
    {
      onError: (err) => {
        console.error('SWR Error:', err)
        toast.error('Failed to load files')
      }
    }
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      try {
        const formData = new FormData()
        acceptedFiles.forEach(file => {
          formData.append('files', file)
        })
        formData.append('path', currentPath)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error('Upload failed')
        
        toast.success('Files uploaded successfully!')
        mutate()
      } catch (error) {
        toast.error('Failed to upload files')
        console.error('Upload error:', error)
      }
    }
  })

  const { directories, regularFiles } = useMemo(() => {
    if (!files) return { directories: [], regularFiles: [] }

    return {
      directories: files.filter(file => file.Key.endsWith('/')),
      regularFiles: files.filter(file => !file.Key.endsWith('/'))
    }
  }, [files])

  const handleDelete = async (key: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch('/api/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })

      if (!response.ok) throw new Error('Delete failed')

      toast.success('File deleted successfully!')
      mutate()
    } catch (error) {
      toast.error('Failed to delete file')
      console.error('Delete error:', error)
    }
  }

  const handleDownload = async (key: string) => {
    try {
      const response = await fetch(`/api/download?key=${encodeURIComponent(key)}`)
      const data = await response.json()
      if (data.url) {
        window.open(data.url, '_blank')
      } else {
        throw new Error('No download URL received')
      }
    } catch (error) {
      toast.error('Failed to download file')
      console.error('Download error:', error)
    }
  }

  const navigateToFolder = (path: string) => {
    setCurrentPath(path)
    setSearchQuery('')
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getDirectoryName = (path: string) => {
    const parts = path.split('/')
    return parts[parts.length - 2] || path
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow">
      {/* Top Bar */}
      <div className="p-4 border-b space-y-4">
        {/* Breadcrumb navigation */}
        <nav className="flex space-x-2 items-center">
          <button
            onClick={() => navigateToFolder('')}
            className="text-blue-600 hover:underline flex items-center"
          >
            <FolderIcon className="w-5 h-5 mr-1" />
            Root
          </button>
          {currentPath.split('/').filter(Boolean).map((segment, index, array) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-gray-500">/</span>
              <button
                onClick={() => navigateToFolder(array.slice(0, index + 1).join('/') + '/')}
                className="text-blue-600 hover:underline flex items-center"
              >
                <FolderIcon className="w-5 h-5 mr-1" />
                {segment}
              </button>
            </div>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          <ViewSelector
            currentView={viewMode}
            onViewChange={setViewMode}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Upload area */}
        <div
          {...getRootProps()}
          className={`mb-6 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag and drop files here, or click to select files'}
          </p>
        </div>

        {/* Directories */}
        {directories.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Directories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {directories.map((dir) => (
                <button
                  key={dir.Key}
                  onClick={() => navigateToFolder(dir.Key)}
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <FolderIcon className="w-6 h-6 text-blue-500 mr-3" />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {getDirectoryName(dir.Key)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        {regularFiles.length > 0 ? (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Files</h2>
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              : "space-y-2"
            }>
              {regularFiles.map((file) => (
                <div
                  key={file.Key}
                  className={`group ${
                    viewMode === 'grid'
                      ? 'p-4 border rounded-lg hover:shadow-md transition-shadow'
                      : 'flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border'
                  }`}
                >
                  {viewMode === 'grid' ? (
                    <div>
                      <FilePreview
                        filename={file.Key.split('/').pop() || ''}
                        size={file.Size}
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatSize(file.Size)}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownload(file.Key)}
                            className="p-1 text-gray-400 hover:text-blue-500"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(file.Key)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3">
                        <DocumentIcon className="w-6 h-6 text-gray-500" />
                        <div>
                          <button
                            onClick={() => handleDownload(file.Key)}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600"
                          >
                            {file.Key.split('/').pop()}
                          </button>
                          <p className="text-xs text-gray-500">
                            {formatSize(file.Size)} • {new Date(file.LastModified).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownload(file.Key)}
                          className="p-2 text-gray-400 hover:text-blue-500"
                        >
                          <ArrowDownTrayIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.Key)}
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            {searchQuery ? 'No files match your search' : 'No files in this directory'}
          </div>
        )}
      </div>
    </div>
  )
} 
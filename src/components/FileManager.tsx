'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  CloudArrowUpIcon,
  FolderIcon,
  DocumentIcon,
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  EllipsisVerticalIcon,
  FolderPlusIcon,
  LinkIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import { SearchBar } from './ui/SearchBar'
import { ViewSelector } from './ui/ViewSelector'
import { FilePreview } from './ui/FilePreview'
import { NewFolderModal } from './ui/NewFolderModal'
import { RenameModal } from './ui/RenameModal'
import { GridSizeControl } from './ui/GridSizeControl'
import { TabBar } from './ui/TabBar'

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

interface FileManagerContentProps {
  path: string
  onNavigate: (path: string) => void
  onMutate: () => void
  getDirectoryName: (path: string) => string
}

interface TabState {
  id: string
  path: string
  label: string
  searchQuery: string
}

export default function FileManager() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [gridSize, setGridSize] = useState(200)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [isUploading, setIsUploading] = useState(false)
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [fileToRename, setFileToRename] = useState<FileObject | null>(null)
  
  const [tabs, setTabs] = useState<TabState[]>([{ 
    id: 'root', 
    path: '', 
    label: 'Root',
    searchQuery: ''
  }])
  const [activeTabId, setActiveTabId] = useState('root')

  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId), [tabs, activeTabId])

  const { data: files, error, mutate } = useSWR<FileObject[]>(
    `/api/files${activeTab?.path ? `?prefix=${activeTab.path}` : ''}${activeTab?.searchQuery ? `&search=${encodeURIComponent(activeTab.searchQuery)}` : ''}`,
    fetcher
  )

  const getDirectoryName = useCallback((path: string) => {
    const parts = path.split('/')
    return parts[parts.length - 2] || path
  }, [])

  const handleTabClick = useCallback((tabId: string) => {
    setActiveTabId(tabId)
  }, [])

  const handleTabClose = useCallback((tabId: string) => {
    if (tabs.length === 1) return // Don't close the last tab
    
    const newTabs = tabs.filter(t => t.id !== tabId)
    setTabs(newTabs)
    
    // If we're closing the active tab, switch to the last tab
    if (tabId === activeTabId) {
      const lastTab = newTabs[newTabs.length - 1]
      setActiveTabId(lastTab.id)
    }
  }, [tabs, activeTabId])

  const addNewTab = useCallback(() => {
    const newTabId = `tab-${Date.now()}`
    const newTab: TabState = { 
      id: newTabId, 
      path: '', 
      label: 'Root',
      searchQuery: ''
    }
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTabId)
  }, [])

  const navigateToFolder = useCallback((path: string) => {
    setTabs(prevTabs => prevTabs.map(tab => 
      tab.id === activeTabId
        ? {
            ...tab,
            path,
            label: path === '' ? 'Root' : path.split('/').filter(Boolean).pop() || 'Root'
          }
        : tab
    ))
  }, [activeTabId])

  const handleSearchChange = useCallback((query: string) => {
    setTabs(prevTabs => prevTabs.map(tab =>
      tab.id === activeTabId
        ? { ...tab, searchQuery: query }
        : tab
    ))
  }, [activeTabId])

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      try {
        setIsUploading(true)
        // Initialize progress for each file
        const initialProgress = acceptedFiles.reduce((acc, file) => {
          acc[file.name] = 0
          return acc
        }, {} as { [key: string]: number })
        setUploadProgress(initialProgress)

        const formData = new FormData()
        acceptedFiles.forEach(file => {
          formData.append('files', file)
        })
        formData.append('path', activeTab?.path || '')

        // Use XMLHttpRequest for upload progress
        const response = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = (event.loaded / event.total) * 100
              // Update progress for all files
              const updatedProgress = Object.keys(initialProgress).reduce((acc, fileName) => {
                acc[fileName] = progress
                return acc
              }, {} as { [key: string]: number })
              setUploadProgress(updatedProgress)
            }
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(xhr.response)
            } else {
              reject(new Error('Upload failed'))
            }
          }

          xhr.onerror = () => reject(new Error('Upload failed'))
          
          xhr.open('POST', '/api/upload')
          xhr.send(formData)
        })

        toast.success('Files uploaded successfully!')
        // Clear progress after successful upload
        setUploadProgress({})
        mutate()
      } catch (error) {
        toast.error('Failed to upload files')
        console.error('Upload error:', error)
      } finally {
        setIsUploading(false)
      }
    }
  })

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

  const handleCopyUrl = (key: string) => {
    // Construct the CDN URL
    const cdnUrl = `${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/${key}`
    navigator.clipboard.writeText(cdnUrl)
      .then(() => toast.success('CDN URL copied to clipboard'))
      .catch(() => toast.error('Failed to copy URL'))
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleCreateFolder = async (name: string) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: activeTab?.path,
          name,
        }),
      })

      if (!response.ok) throw new Error('Failed to create folder')

      toast.success('Folder created successfully')
      mutate()
    } catch (error) {
      toast.error('Failed to create folder')
      console.error('Create folder error:', error)
    }
  }

  const handleRename = async (newName: string) => {
    if (!fileToRename) return

    try {
      const oldKey = fileToRename.Key
      const pathParts = oldKey.split('/')
      pathParts[pathParts.length - 1] = newName
      const newKey = pathParts.join('/')

      const response = await fetch('/api/files/rename', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldKey,
          newKey,
        }),
      })

      if (!response.ok) throw new Error('Failed to rename file')

      toast.success('File renamed successfully')
      mutate()
    } catch (error) {
      toast.error('Failed to rename file')
      console.error('Rename error:', error)
    }
  }

  const openRenameModal = (file: FileObject) => {
    setFileToRename(file)
    setIsRenameModalOpen(true)
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow">
      {/* Top Bar */}
      <div className="p-4 border-b space-y-4">
        {/* Tabs */}
        <div className="flex items-center space-x-2">
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabClick={handleTabClick}
            onTabClose={handleTabClose}
          />
          <button
            onClick={addNewTab}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
            title="New tab"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Breadcrumb navigation */}
        <nav className="flex space-x-2 items-center">
          <button
            onClick={() => navigateToFolder('')}
            className="text-blue-600 hover:underline flex items-center"
          >
            <FolderIcon className="w-5 h-5 mr-1" />
            Root
          </button>
          {activeTab?.path.split('/').filter(Boolean).map((segment, index, array) => (
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
              value={activeTab?.searchQuery || ''}
              onChange={handleSearchChange}
            />
          </div>
          <button
            onClick={() => setIsNewFolderModalOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FolderPlusIcon className="h-5 w-5 mr-1" />
            New Folder
          </button>
          {viewMode === 'grid' && (
            <GridSizeControl
              value={gridSize}
              onChange={setGridSize}
            />
          )}
          <ViewSelector
            currentView={viewMode}
            onViewChange={setViewMode}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Upload area */}
        <div
          {...getRootProps()}
          className={`mb-6 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors relative
            ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className={`w-12 h-12 mx-auto ${isUploading ? 'text-blue-500 animate-bounce' : 'text-gray-400'}`} />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? 'Drop the files here...'
              : isUploading
              ? 'Uploading files...'
              : 'Drag and drop files here, or click to select files'}
          </p>
          
          {/* Upload Progress */}
          {isUploading && Object.keys(uploadProgress).length > 0 && (
            <div className="mt-4 space-y-3 max-w-md mx-auto">
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="text-left">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className="truncate">{fileName}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* File List */}
        <div className="flex-1 overflow-auto p-4">
          {/* Directories */}
          {files && files.filter(file => file.Key.endsWith('/')).length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Directories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.filter(file => file.Key.endsWith('/')).map((dir) => (
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
          {files && files.filter(file => !file.Key.endsWith('/')).length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Files</h2>
              <div className={viewMode === 'grid' 
                ? "grid gap-4"
                : "space-y-2"
              }
              style={{
                gridTemplateColumns: viewMode === 'grid' ? `repeat(auto-fill, minmax(${gridSize}px, 1fr))` : '',
              }}
              >
                {files.filter(file => !file.Key.endsWith('/')).map((file) => (
                  <div
                    key={file.Key}
                    className={`group ${
                      viewMode === 'grid'
                        ? 'p-4 border rounded-lg hover:shadow-md transition-shadow'
                        : 'flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border'
                    }`}
                    style={viewMode === 'grid' ? { minHeight: `${gridSize}px` } : undefined}
                  >
                    {viewMode === 'grid' ? (
                      <div>
                        <FilePreview
                          filename={file.Key.split('/').pop() || ''}
                          size={file.Size}
                          url={`/api/files/preview?key=${encodeURIComponent(file.Key)}`}
                        />
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatSize(file.Size)}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopyUrl(file.Key)
                              }}
                              className="p-1 text-gray-400 hover:text-blue-500"
                              title="Copy CDN URL"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                openRenameModal(file)
                              }}
                              className="p-1 text-gray-400 hover:text-blue-500"
                              title="Rename file"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
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
                          <FilePreview
                            filename={file.Key.split('/').pop() || ''}
                            size={file.Size}
                            mode="list"
                            url={`/api/files/preview?key=${encodeURIComponent(file.Key)}`}
                          />
                          <div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopyUrl(file.Key)
                              }}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600"
                              title="Copy CDN URL"
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
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopyUrl(file.Key)
                            }}
                            className="p-2 text-gray-400 hover:text-blue-500"
                            title="Copy CDN URL"
                          >
                            <LinkIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openRenameModal(file)
                            }}
                            className="p-2 text-gray-400 hover:text-blue-500"
                            title="Rename file"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
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
              {activeTab?.searchQuery ? 'No files match your search' : 'No files in this directory'}
            </div>
          )}
        </div>
      </div>

      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        onSubmit={handleCreateFolder}
        currentPath={activeTab?.path || ''}
      />

      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => {
          setIsRenameModalOpen(false)
          setFileToRename(null)
        }}
        onSubmit={handleRename}
        currentName={fileToRename?.Key.split('/').pop() || ''}
      />
    </div>
  )
} 
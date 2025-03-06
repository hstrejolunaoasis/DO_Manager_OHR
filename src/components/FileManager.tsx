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
  CheckCircleIcon,
  CheckIcon,
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
  isDirectory?: boolean
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
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [lastSelectedFile, setLastSelectedFile] = useState<string | null>(null)
  
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
      
      // Handle folder rename
      if (fileToRename.isDirectory) {
        // Remove trailing slash for folders
        pathParts.pop()
        // Replace the last part with new name and add trailing slash
        pathParts[pathParts.length - 1] = newName
        const newKey = pathParts.join('/') + '/'
        
        const response = await fetch('/api/folders/rename', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            oldKey,
            newKey,
          }),
        })

        if (!response.ok) throw new Error('Failed to rename folder')
      } else {
        // Handle file rename (existing logic)
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
      }

      toast.success(`${fileToRename.isDirectory ? 'Folder' : 'File'} renamed successfully`)
      mutate()
    } catch (error) {
      toast.error(`Failed to rename ${fileToRename.isDirectory ? 'folder' : 'file'}`)
      console.error('Rename error:', error)
    }
  }

  const openRenameModal = (item: FileObject) => {
    setFileToRename({
      ...item,
      isDirectory: item.Key.endsWith('/')
    })
    setIsRenameModalOpen(true)
  }

  const handleFileSelect = useCallback((key: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    setSelectedFiles(prev => {
      const newSelection = new Set(prev)
      
      if (event.shiftKey && lastSelectedFile) {
        // Get all files between last selected and current
        const fileList = files?.filter(f => !f.Key.endsWith('/')) || []
        const lastIndex = fileList.findIndex(f => f.Key === lastSelectedFile)
        const currentIndex = fileList.findIndex(f => f.Key === key)
        const [start, end] = [Math.min(lastIndex, currentIndex), Math.max(lastIndex, currentIndex)]
        
        // Toggle the selection state based on the last selected file's state
        const isLastSelected = prev.has(lastSelectedFile)
        fileList.slice(start, end + 1).forEach(f => {
          if (isLastSelected) {
            newSelection.add(f.Key)
          } else {
            newSelection.delete(f.Key)
          }
        })
      } else {
        // Toggle selection
        if (newSelection.has(key)) {
          newSelection.delete(key)
        } else {
          newSelection.add(key)
        }
      }
      
      return newSelection
    })
    
    setLastSelectedFile(key)
  }, [files, lastSelectedFile])

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedFiles.size} files?`)) return

    try {
      const promises = Array.from(selectedFiles).map(key =>
        fetch('/api/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key }),
        })
      )

      await Promise.all(promises)
      toast.success('Files deleted successfully!')
      setSelectedFiles(new Set())
      mutate()
    } catch (error) {
      toast.error('Failed to delete some files')
      console.error('Bulk delete error:', error)
    }
  }

  const handleBulkDownload = async () => {
    try {
      const promises = Array.from(selectedFiles).map(async key => {
        const response = await fetch(`/api/download?key=${encodeURIComponent(key)}`)
        const data = await response.json()
        if (data.url) {
          window.open(data.url, '_blank')
        }
      })

      await Promise.all(promises)
      toast.success('Started downloading files')
    } catch (error) {
      toast.error('Failed to download some files')
      console.error('Bulk download error:', error)
    }
  }

  useEffect(() => {
    setSelectedFiles(new Set())
  }, [activeTabId, activeTab?.path])

  return (
    <div className="h-full flex flex-col bg-card dark:bg-accent rounded-lg shadow-lg dark:shadow-none">
      {/* Top Bar */}
      <div className="p-4 border-b border-border space-y-4">
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
            className="p-1 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-card-hover dark:hover:bg-accent transition-colors"
            title="New tab"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Breadcrumb navigation */}
        <nav className="flex space-x-2 items-center">
          <button
            onClick={() => navigateToFolder('')}
            className="text-primary hover:text-primary-hover flex items-center"
          >
            <FolderIcon className="w-5 h-5 mr-1" />
            Root
          </button>
          {activeTab?.path.split('/').filter(Boolean).map((segment, index, array) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-text-tertiary">/</span>
              <button
                onClick={() => navigateToFolder(array.slice(0, index + 1).join('/') + '/')}
                className="text-primary hover:text-primary-hover flex items-center"
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
          
          {selectedFiles.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary">
                {selectedFiles.size} selected
              </span>
              <button
                onClick={handleBulkDownload}
                className="inline-flex items-center px-3 py-2 border border-border bg-card dark:bg-accent shadow-sm text-sm leading-4 font-medium rounded-md text-text-primary hover:bg-card-hover dark:hover:bg-accent transition-colors"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                Download
              </button>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-700 shadow-sm text-sm leading-4 font-medium rounded-md text-red-600 dark:text-red-400 bg-card dark:bg-accent hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          )}

          <button
            onClick={() => setIsNewFolderModalOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-border bg-card dark:bg-accent shadow-sm text-sm leading-4 font-medium rounded-md text-text-primary hover:bg-card-hover dark:hover:bg-accent transition-colors"
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
            ${isDragActive 
              ? 'border-primary bg-primary/5 dark:bg-primary/10' 
              : 'border-border hover:border-primary dark:hover:border-primary'}`}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className={`w-12 h-12 mx-auto ${isUploading ? 'text-primary animate-bounce' : 'text-text-tertiary'}`} />
          <p className="mt-2 text-sm text-text-secondary">
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
                  <div className="flex justify-between text-xs text-text-tertiary mb-1">
                    <span className="truncate">{fileName}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-card-hover dark:bg-accent rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
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
              <h2 className="text-lg font-semibold mb-3 text-text-primary">Directories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.filter(file => file.Key.endsWith('/')).map((dir) => (
                  <div
                    key={dir.Key}
                    className="group flex items-center justify-between p-3 rounded-lg border border-border bg-card dark:bg-accent hover:bg-card-hover dark:hover:bg-accent/80 transition-colors"
                  >
                    <button
                      onClick={() => navigateToFolder(dir.Key)}
                      className="flex items-center flex-1"
                    >
                      <FolderIcon className="w-6 h-6 text-primary mr-3" />
                      <span className="text-sm font-medium text-text-primary truncate">
                        {getDirectoryName(dir.Key)}
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openRenameModal(dir)
                      }}
                      className="p-2 text-text-tertiary hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Rename folder"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {files && files.filter(file => !file.Key.endsWith('/')).length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-text-primary">Files</h2>
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
                    className={`group relative ${
                      viewMode === 'grid'
                        ? 'p-4 border border-border bg-card dark:bg-accent rounded-lg hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/10 transition-all'
                        : 'flex items-center justify-between p-3 hover:bg-card-hover dark:hover:bg-accent/80 rounded-lg border border-border'
                    } ${selectedFiles.has(file.Key) ? 'ring-2 ring-primary' : ''}`}
                    style={viewMode === 'grid' ? { minHeight: `${gridSize}px` } : undefined}
                  >
                    <div 
                      className={`absolute ${viewMode === 'grid' ? 'top-2 right-2' : 'left-2'} z-10`}
                      onClick={(e) => handleFileSelect(file.Key, e)}
                    >
                      <div 
                        className={`w-5 h-5 rounded border ${
                          selectedFiles.has(file.Key)
                            ? 'bg-primary border-primary'
                            : 'border-border bg-white dark:bg-accent'
                        } flex items-center justify-center cursor-pointer hover:border-primary transition-colors`}
                      >
                        {selectedFiles.has(file.Key) && (
                          <CheckIcon className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                    {viewMode === 'grid' ? (
                      <div>
                        <FilePreview
                          filename={file.Key.split('/').pop() || ''}
                          size={file.Size}
                          url={`/api/files/preview?key=${encodeURIComponent(file.Key)}`}
                        />
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-text-tertiary">
                            {formatSize(file.Size)}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopyUrl(file.Key)
                              }}
                              className="p-1 text-text-tertiary hover:text-primary"
                              title="Copy CDN URL"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                openRenameModal(file)
                              }}
                              className="p-1 text-text-tertiary hover:text-primary"
                              title="Rename file"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(file.Key)}
                              className="p-1 text-text-tertiary hover:text-primary"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(file.Key)}
                              className="p-1 text-text-tertiary hover:text-red-500"
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
                              className="text-sm font-medium text-text-primary hover:text-primary"
                              title="Copy CDN URL"
                            >
                              {file.Key.split('/').pop()}
                            </button>
                            <p className="text-xs text-text-tertiary">
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
                            className="p-2 text-text-tertiary hover:text-primary"
                            title="Copy CDN URL"
                          >
                            <LinkIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openRenameModal(file)
                            }}
                            className="p-2 text-text-tertiary hover:text-primary"
                            title="Rename file"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDownload(file.Key)}
                            className="p-2 text-text-tertiary hover:text-primary"
                          >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(file.Key)}
                            className="p-2 text-text-tertiary hover:text-red-500"
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
            <div className="text-center text-text-tertiary py-4">
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
import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react'
import useSWR from 'swr'
import toast from 'react-hot-toast'

// Types
export interface FileObject {
  Key: string
  LastModified: Date
  Size: number
  Type: string
}

export interface TabState {
  id: string
  path: string
  label: string
  searchQuery: string
  viewMode: 'grid' | 'list' | 'tree'
}

// Context type
interface FileManagerContextType {
  // State
  viewMode: 'grid' | 'list' | 'tree'
  setViewMode: (mode: 'grid' | 'list' | 'tree') => void
  gridSize: number
  setGridSize: (size: number) => void
  selectedFile: string | null
  setSelectedFile: (file: string | null) => void
  isNewFolderModalOpen: boolean
  setIsNewFolderModalOpen: (isOpen: boolean) => void
  isRenameModalOpen: boolean
  setIsRenameModalOpen: (isOpen: boolean) => void
  fileToRename: FileObject | null
  setFileToRename: (file: FileObject | null) => void
  uploadProgress: { [key: string]: number }
  setUploadProgress: (progress: { [key: string]: number }) => void
  isUploading: boolean
  setIsUploading: (isUploading: boolean) => void
  
  // Tabs
  tabs: TabState[]
  activeTabId: string
  activeTab: TabState | undefined
  handleTabClick: (tabId: string) => void
  handleTabClose: (tabId: string) => void
  addNewTab: () => void
  
  // Navigation
  navigateToFolder: (path: string) => void
  handleSearchChange: (query: string) => void
  
  // Files data
  files: FileObject[] | undefined
  error: any
  mutate: () => Promise<FileObject[] | undefined>
  
  // File operations
  handleDelete: (key: string) => Promise<void>
  handleDownload: (key: string) => Promise<void>
  handleCopyUrl: (key: string) => void
  handleCreateFolder: (name: string) => Promise<void>
  handleRename: (newName: string) => Promise<void>
  openRenameModal: (file: FileObject) => void
  
  // Utilities
  formatSize: (bytes: number) => string
  getDirectoryName: (path: string) => string
}

// Fetcher function
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Failed to fetch data')
  }
  return res.json()
}

// Create context
const FileManagerContext = createContext<FileManagerContextType | undefined>(undefined)

// Provider component
export function FileManagerProvider({ children }: { children: ReactNode }) {
  // View state
  const [gridSize, setGridSize] = useState(200)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  
  // Modal state
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false)
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [fileToRename, setFileToRename] = useState<FileObject | null>(null)
  
  // Upload state
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [isUploading, setIsUploading] = useState(false)
  
  // Tab state
  const [tabs, setTabs] = useState<TabState[]>([{ 
    id: 'root', 
    path: '', 
    label: 'Root',
    searchQuery: '',
    viewMode: 'grid'
  }])
  const [activeTabId, setActiveTabId] = useState('root')

  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId), [tabs, activeTabId])

  // View mode getter and setter
  const viewMode = activeTab?.viewMode || 'grid'
  const setViewMode = useCallback((mode: 'grid' | 'list' | 'tree') => {
    setTabs(prevTabs => prevTabs.map(tab =>
      tab.id === activeTabId
        ? { ...tab, viewMode: mode }
        : tab
    ))
  }, [activeTabId])

  // Data fetching
  const { data: files, error, mutate } = useSWR<FileObject[]>(
    `/api/files?${new URLSearchParams({
      ...(activeTab?.path ? { prefix: activeTab.path } : {}),
      ...(activeTab?.searchQuery ? { search: activeTab.searchQuery } : {}),
      viewMode
    }).toString()}`,
    fetcher
  )

  // Tab operations
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
      searchQuery: '',
      viewMode: 'grid'
    }
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTabId)
  }, [])

  // Navigation
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

  // File operations
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

  const handleCopyUrl = (key: string) => {
    // Construct the CDN URL
    const cdnUrl = `${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/${key}`
    navigator.clipboard.writeText(cdnUrl)
      .then(() => toast.success('CDN URL copied to clipboard'))
      .catch(() => toast.error('Failed to copy URL'))
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

  // Utilities
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getDirectoryName = useCallback((path: string) => {
    const parts = path.split('/')
    return parts[parts.length - 2] || path
  }, [])

  // Context value
  const contextValue = {
    // State
    viewMode,
    setViewMode,
    gridSize,
    setGridSize,
    selectedFile,
    setSelectedFile,
    isNewFolderModalOpen,
    setIsNewFolderModalOpen,
    isRenameModalOpen,
    setIsRenameModalOpen,
    fileToRename,
    setFileToRename,
    uploadProgress,
    setUploadProgress,
    isUploading,
    setIsUploading,
    
    // Tabs
    tabs,
    activeTabId,
    activeTab,
    handleTabClick,
    handleTabClose,
    addNewTab,
    
    // Navigation
    navigateToFolder,
    handleSearchChange,
    
    // Files data
    files,
    error,
    mutate,
    
    // File operations
    handleDelete,
    handleDownload,
    handleCopyUrl,
    handleCreateFolder,
    handleRename,
    openRenameModal,
    
    // Utilities
    formatSize,
    getDirectoryName,
  }

  return (
    <FileManagerContext.Provider value={contextValue}>
      {children}
    </FileManagerContext.Provider>
  )
}

// Custom hook to use the context
export function useFileManager() {
  const context = useContext(FileManagerContext)
  if (context === undefined) {
    throw new Error('useFileManager must be used within a FileManagerProvider')
  }
  return context
} 
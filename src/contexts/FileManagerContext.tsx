import { createContext, useContext, useState, useMemo, useCallback, ReactNode, useEffect } from 'react'
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

export interface PaneState {
  id: string
  tabs: TabState[]
  activeTabId: string
  width: number // Percentage of total width
}

// Context type
interface FileManagerContextType {
  // Pane Management
  panes: PaneState[]
  activePaneId: string
  setActivePaneId: (id: string) => void
  addPane: () => void
  removePane: (id: string) => void
  updatePaneWidth: (id: string, width: number) => void
  moveTabToPane: (tabId: string, fromPaneId: string, toPaneId: string) => void
  getActivePane: () => PaneState
  
  // Tab operations
  handleTabClick: (tabId: string) => void
  handleTabClose: (tabId: string) => void
  addNewTab: () => void
  
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
  
  // Navigation
  navigateToFolder: (path: string, paneId: string) => void
  handleSearchChange: (query: string, paneId: string) => void
  
  // Files data
  getFilesForPane: (paneId: string) => FileObject[] | undefined
  error: any
  mutate: () => Promise<void>
  
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
  // Pane state
  const [panes, setPanes] = useState<PaneState[]>([{
    id: 'pane-1',
    tabs: [{ 
      id: 'root', 
      path: '', 
      label: 'Root',
      searchQuery: '',
      viewMode: 'grid'
    }],
    activeTabId: 'root',
    width: 100
  }])
  const [activePaneId, setActivePaneId] = useState('pane-1')

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

  // Files data per pane
  const [filesPerPane, setFilesPerPane] = useState<{ [paneId: string]: FileObject[] }>({})
  const [loadingPanes, setLoadingPanes] = useState<Set<string>>(new Set())

  // Get active pane and tab
  const getActivePane = useCallback(() => {
    return panes.find(p => p.id === activePaneId) || panes[0]
  }, [panes, activePaneId])

  const activeTab = useMemo(() => {
    const activePane = getActivePane()
    return activePane.tabs.find(t => t.id === activePane.activeTabId)
  }, [getActivePane])

  // View mode getter and setter
  const viewMode = activeTab?.viewMode || 'grid'
  const setViewMode = useCallback((mode: 'grid' | 'list' | 'tree') => {
    setPanes(prevPanes => prevPanes.map(pane =>
      pane.id === activePaneId
        ? {
            ...pane,
            tabs: pane.tabs.map(tab =>
              tab.id === pane.activeTabId
                ? { ...tab, viewMode: mode }
                : tab
            )
          }
        : pane
    ))
  }, [activePaneId])

  // Get files for a specific pane
  const getFilesForPane = useCallback((paneId: string) => {
    return filesPerPane[paneId]
  }, [filesPerPane])

  // Fetch files for a specific pane
  const fetchFilesForPane = useCallback(async (paneId: string) => {
    const pane = panes.find(p => p.id === paneId)
    if (!pane) return

    const activeTab = pane.tabs.find(t => t.id === pane.activeTabId)
    if (!activeTab) return

    setLoadingPanes(prev => new Set([...prev, paneId]))

    try {
      const response = await fetch(`/api/files?${new URLSearchParams({
        ...(activeTab.path ? { prefix: activeTab.path } : {}),
        ...(activeTab.searchQuery ? { search: activeTab.searchQuery } : {}),
        viewMode: activeTab.viewMode
      }).toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch files')
      }

      const data = await response.json()
      setFilesPerPane(prev => ({
        ...prev,
        [paneId]: data
      }))
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoadingPanes(prev => {
        const next = new Set(prev)
        next.delete(paneId)
        return next
      })
    }
  }, [panes])

  // Pane operations
  const addPane = useCallback(() => {
    const newPaneId = `pane-${Date.now()}`
    const newTabId = `tab-${Date.now()}`
    
    setPanes(prevPanes => {
      const totalPanes = prevPanes.length
      const newWidth = 100 / (totalPanes + 1)
      
      return [
        ...prevPanes.map(pane => ({ ...pane, width: newWidth })),
        {
          id: newPaneId,
          tabs: [{
            id: newTabId,
            path: '',
            label: 'Root',
            searchQuery: '',
            viewMode: 'grid'
          }],
          activeTabId: newTabId,
          width: newWidth
        }
      ]
    })
    
    setActivePaneId(newPaneId)
  }, [])

  const removePane = useCallback((paneId: string) => {
    setPanes(prevPanes => {
      if (prevPanes.length === 1) return prevPanes // Don't remove the last pane
      
      const remainingPanes = prevPanes.filter(p => p.id !== paneId)
      const newWidth = 100 / remainingPanes.length
      
      return remainingPanes.map(pane => ({
        ...pane,
        width: newWidth
      }))
    })
    
    // If removing active pane, switch to the first available pane
    if (paneId === activePaneId) {
      const newActivePane = panes.find(p => p.id !== paneId)
      if (newActivePane) {
        setActivePaneId(newActivePane.id)
      }
    }
  }, [panes, activePaneId])

  const updatePaneWidth = useCallback((paneId: string, width: number) => {
    setPanes(prevPanes => prevPanes.map(pane =>
      pane.id === paneId ? { ...pane, width } : pane
    ))
  }, [])

  const moveTabToPane = useCallback((tabId: string, fromPaneId: string, toPaneId: string) => {
    setPanes(prevPanes => {
      const fromPane = prevPanes.find(p => p.id === fromPaneId)
      const toPane = prevPanes.find(p => p.id === toPaneId)
      
      if (!fromPane || !toPane) return prevPanes
      
      const tab = fromPane.tabs.find(t => t.id === tabId)
      if (!tab) return prevPanes
      
      return prevPanes.map(pane => {
        if (pane.id === fromPaneId) {
          const newTabs = pane.tabs.filter(t => t.id !== tabId)
          const newActiveTabId = tabId === pane.activeTabId
            ? newTabs[0]?.id || ''
            : pane.activeTabId
          
          return {
            ...pane,
            tabs: newTabs,
            activeTabId: newActiveTabId
          }
        }
        
        if (pane.id === toPaneId) {
          return {
            ...pane,
            tabs: [...pane.tabs, tab],
            activeTabId: tab.id
          }
        }
        
        return pane
      })
    })
  }, [])

  // Tab operations
  const handleTabClick = useCallback((tabId: string) => {
    setPanes(prevPanes => prevPanes.map(pane =>
      pane.id === activePaneId
        ? { ...pane, activeTabId: tabId }
        : pane
    ))
  }, [activePaneId])

  const handleTabClose = useCallback((tabId: string) => {
    setPanes(prevPanes => prevPanes.map(pane => {
      if (pane.id !== activePaneId) return pane
      
      if (pane.tabs.length === 1) return pane // Don't close the last tab
      
      const newTabs = pane.tabs.filter(t => t.id !== tabId)
      const newActiveTabId = tabId === pane.activeTabId
        ? newTabs[newTabs.length - 1].id
        : pane.activeTabId
      
      return {
        ...pane,
        tabs: newTabs,
        activeTabId: newActiveTabId
      }
    }))
  }, [activePaneId])

  const addNewTab = useCallback(() => {
    const newTabId = `tab-${Date.now()}`
    setPanes(prevPanes => prevPanes.map(pane =>
      pane.id === activePaneId
        ? {
            ...pane,
            tabs: [...pane.tabs, {
              id: newTabId,
              path: '',
              label: 'Root',
              searchQuery: '',
              viewMode: 'grid'
            }],
            activeTabId: newTabId
          }
        : pane
    ))
  }, [activePaneId])

  // Navigation
  const navigateToFolder = useCallback((path: string, paneId: string) => {
    setPanes(prevPanes => prevPanes.map(pane =>
      pane.id === paneId
        ? {
            ...pane,
            tabs: pane.tabs.map(tab =>
              tab.id === pane.activeTabId
                ? {
                    ...tab,
                    path,
                    label: path === '' ? 'Root' : path.split('/').filter(Boolean).pop() || 'Root'
                  }
                : tab
            )
          }
        : pane
    ))
    
    // Fetch new files for this pane
    fetchFilesForPane(paneId)
  }, [fetchFilesForPane])

  const handleSearchChange = useCallback((query: string, paneId: string) => {
    setPanes(prevPanes => prevPanes.map(pane =>
      pane.id === paneId
        ? {
            ...pane,
            tabs: pane.tabs.map(tab =>
              tab.id === pane.activeTabId
                ? { ...tab, searchQuery: query }
                : tab
            )
          }
        : pane
    ))
    
    // Fetch new files for this pane
    fetchFilesForPane(paneId)
  }, [fetchFilesForPane])

  // Effect to fetch initial files for each pane
  useEffect(() => {
    panes.forEach(pane => {
      fetchFilesForPane(pane.id)
    })
  }, []) // Only run on mount

  // Effect to fetch files when active tab changes
  useEffect(() => {
    panes.forEach(pane => {
      const activeTab = pane.tabs.find(t => t.id === pane.activeTabId)
      if (activeTab) {
        fetchFilesForPane(pane.id)
      }
    })
  }, [panes, fetchFilesForPane])

  // Update mutate to refresh all panes
  const mutate = useCallback(async () => {
    await Promise.all(panes.map(pane => fetchFilesForPane(pane.id)))
  }, [panes, fetchFilesForPane])

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
    // Pane Management
    panes,
    activePaneId,
    setActivePaneId,
    addPane,
    removePane,
    updatePaneWidth,
    moveTabToPane,
    getActivePane,
    
    // Tab operations
    handleTabClick,
    handleTabClose,
    addNewTab,
    
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
    
    // Navigation
    navigateToFolder,
    handleSearchChange,
    
    // Files data
    getFilesForPane,
    error: null, // We're handling errors per-pane now
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
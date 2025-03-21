import { createContext, useContext, useState, useMemo, useCallback, ReactNode, useEffect } from 'react'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import historyService from '../services/historyService'
import { HistoryEntry, OperationType } from '../types/historyTypes'
import { useBucket } from './BucketContext'

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
  viewMode: 'grid' | 'list'
}

export interface PaneState {
  id: string
  tabs: TabState[]
  activeTabId: string
  width: number // Percentage of total width
}

interface FileToUpload {
  file: File
  path: string
  remainingFiles?: File[]
  currentPath?: string
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
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
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
  handleDeleteFolder: (key: string) => Promise<void>
  
  // Utilities
  formatSize: (bytes: number) => string
  getDirectoryName: (path: string) => string
  
  // Privacy Modal
  isPrivacyModalOpen: boolean
  setIsPrivacyModalOpen: (isOpen: boolean) => void
  fileToSetPrivacy: FileToUpload | null
  setFileToSetPrivacy: (file: FileToUpload | null) => void
  handleSetPrivacy: (isPrivate: boolean) => Promise<void>

  // Delete Modal
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (isOpen: boolean) => void;
  itemToDelete: { key: string; isDirectory: boolean; itemCount?: number } | null;
  setItemToDelete: (item: { key: string; isDirectory: boolean; itemCount?: number } | null) => void;
  handleDeleteConfirm: () => Promise<void>;

  // History
  history: HistoryEntry[];
  clearHistory: () => void;
  undoOperation: (entryId: string) => Promise<void>;
  isHistoryPanelOpen: boolean;
  setIsHistoryPanelOpen: (isOpen: boolean) => void;

  // Bucket information
  currentBucketName: string | null;
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
  // Get current bucket from BucketContext
  const { currentBucket } = useBucket();
  
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

  // Privacy Modal state
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
  const [fileToSetPrivacy, setFileToSetPrivacy] = useState<FileToUpload | null>(null)

  // Delete Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ key: string; isDirectory: boolean; itemCount?: number } | null>(null);
  
  // History state
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState<boolean>(false);
  
  // Fetch history from service
  useEffect(() => {
    setHistory(historyService.getHistory());
  }, []);
  
  // Clear history
  const clearHistory = useCallback(() => {
    historyService.clearHistory();
    setHistory([]);
  }, []);
  
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
        ...(currentBucket?.name ? { bucket: currentBucket.name } : {})
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
  }, [panes, currentBucket?.name])

  // Update mutate to refresh all panes
  const mutate = useCallback(async () => {
    await Promise.all(panes.map(pane => fetchFilesForPane(pane.id)))
  }, [panes, fetchFilesForPane])

  // Function to undo an operation
  const undoOperation = useCallback(async (entryId: string) => {
    const entry = history.find(h => h.id === entryId);
    
    if (!entry || entry.undone || !entry.undoable) {
      return;
    }
    
    try {
      switch (entry.operationType) {
        case OperationType.DELETE_FILE:
        case OperationType.DELETE_FOLDER:
          // For now, we'll show a message that restoration isn't implemented
          toast.error('File restoration not implemented yet');
          break;
          
        case OperationType.RENAME_FILE:
        case OperationType.RENAME_FOLDER:
          if (entry.details.oldKey && entry.details.newKey) {
            await fetch('/api/files/rename', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                oldKey: entry.details.newKey,
                newKey: entry.details.oldKey
              })
            });
            toast.success('Rename undone successfully');
          }
          break;
          
        case OperationType.CREATE_FOLDER:
          if (entry.details.key) {
            await fetch('/api/folders/delete', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                key: entry.details.key
              })
            });
            toast.success('Folder creation undone');
          }
          break;
          
        case OperationType.UPLOAD_FILE:
          if (entry.details.key) {
            await fetch('/api/files/delete', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                key: entry.details.key
              })
            });
            toast.success('File upload undone');
          }
          break;
      }
      
      // Mark operation as undone
      historyService.markAsUndone(entryId);
      setHistory(historyService.getHistory());
      
      // Refresh file list
      mutate();
    } catch (error) {
      console.error('Undo error:', error);
      toast.error('Failed to undo operation');
    }
  }, [history, mutate]);
  
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
  const setViewMode = useCallback((mode: 'grid' | 'list') => {
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

  // Update when the bucket changes
  useEffect(() => {
    // Refresh all files when bucket changes
    if (currentBucket) {
      mutate();
    }
  }, [currentBucket, mutate]);

  // File operations
  const handleDelete = async (key: string) => {
    setItemToDelete({ key, isDirectory: false });
    setIsDeleteModalOpen(true);
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

  const handleCreateFolder = async (name: string): Promise<void> => {
    // Get the current path
    const activePane = getActivePane()
    const activeTab = activePane.tabs.find(tab => tab.id === activePane.activeTabId)
    if (!activeTab) return

    const currentPath = activeTab.path
    const newFolderPath = `${currentPath}${name}/`

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: newFolderPath,
          bucket: currentBucket?.name,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create folder')
      }

      // Add to history
      const historyEntry: HistoryEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        operationType: OperationType.CREATE_FOLDER,
        details: {
          key: newFolderPath,
          bucket: currentBucket?.name,
        },
        undoable: true,
        undone: false,
      }
      
      historyService.addEntry(historyEntry)
      setHistory(historyService.getHistory())

      await mutate()
      setIsNewFolderModalOpen(false)
      toast.success('Folder created successfully')
    } catch (error) {
      console.error('Error creating folder:', error)
      toast.error(`Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  const handleRename = async (newName: string): Promise<void> => {
    if (!fileToRename) return
    
    try {
      const oldPath = fileToRename.Key
      const pathParts = oldPath.split('/')
      pathParts.pop() // Remove the old filename
      
      // For folders, keep the trailing slash
      const isFolder = fileToRename.Type === 'folder'
      const newPath = isFolder 
        ? [...pathParts, newName, ''].join('/') // Folder with trailing slash
        : [...pathParts, newName].join('/')
      
      const response = await fetch('/api/files/rename', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldKey: oldPath,
          newKey: newPath,
          bucket: currentBucket?.name,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to rename file')
      }
      
      // Add to history
      const historyEntry: HistoryEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        operationType: isFolder ? OperationType.RENAME_FOLDER : OperationType.RENAME_FILE,
        details: {
          oldKey: oldPath,
          newKey: newPath,
          bucket: currentBucket?.name,
        },
        undoable: true,
        undone: false,
      }
      
      historyService.addEntry(historyEntry)
      setHistory(historyService.getHistory())
      
      await mutate()
      setIsRenameModalOpen(false)
      setFileToRename(null)
      toast.success(`${isFolder ? 'Folder' : 'File'} renamed successfully`)
    } catch (error) {
      console.error('Error renaming file:', error)
      toast.error(`Failed to rename ${fileToRename.Type}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const openRenameModal = (file: FileObject) => {
    setFileToRename(file)
    setIsRenameModalOpen(true)
  }

  const handleDeleteFolder = async (key: string) => {
    // You may want to add logic here to count items in the folder if needed
    setItemToDelete({ key, isDirectory: true });
    setIsDeleteModalOpen(true);
  };

  // Add new function to handle confirmed deletion
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    const { key, isDirectory } = itemToDelete;
    
    try {
      if (isDirectory) {
        // Handle folder deletion
        const response = await fetch('/api/folders/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ key })
        });
        
        if (!response.ok) throw new Error('Folder deletion failed');
        
        const data = await response.json();
        
        // Add history entry
        const historyEntry = historyService.addEntry({
          operationType: OperationType.DELETE_FOLDER,
          details: {
            key,
            isDirectory: true
          },
          undoable: false // For now, we don't support restoring deleted folders
        });
        setHistory(historyService.getHistory());
        
        toast.success(`Folder deleted successfully! Removed ${data.objectsDeleted} items.`);
      } else {
        // Handle file deletion
        const response = await fetch('/api/files/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ key })
        });
        
        if (!response.ok) throw new Error('File deletion failed');
        
        // Add history entry
        const historyEntry = historyService.addEntry({
          operationType: OperationType.DELETE_FILE,
          details: {
            key,
            isDirectory: false
          },
          undoable: false // For now, we don't support restoring deleted files
        });
        setHistory(historyService.getHistory());
        
        toast.success('File deleted successfully!');
      }
      
      mutate();
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error(`Failed to delete ${isDirectory ? 'folder' : 'file'}`);
      console.error('Deletion error:', error);
    }
  };

  // Handle privacy setting
  const handleSetPrivacy = useCallback(async (isPrivate: boolean) => {
    if (!fileToSetPrivacy) return

    try {
      setIsUploading(true)
      // Initialize progress for the file
      setUploadProgress(prev => ({
        ...prev,
        [fileToSetPrivacy.file.name]: 0
      }))

      const formData = new FormData()
      formData.append('files', fileToSetPrivacy.file)
      formData.append('path', fileToSetPrivacy.path)
      formData.append('isPrivate', String(isPrivate))

      // Use XMLHttpRequest for upload progress
      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100
            setUploadProgress(prev => ({
              ...prev,
              [fileToSetPrivacy.file.name]: progress
            }))
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

      toast.success(`${fileToSetPrivacy.file.name} uploaded successfully!`)
      setUploadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[fileToSetPrivacy.file.name]
        return newProgress
      })
      mutate()

      // Add history entry for upload
      const uploadPath = `${fileToSetPrivacy.path}${fileToSetPrivacy.file.name}`;
      const historyEntry = historyService.addEntry({
        operationType: OperationType.UPLOAD_FILE,
        details: {
          key: uploadPath,
          name: fileToSetPrivacy.file.name,
          size: fileToSetPrivacy.file.size,
          isDirectory: false
        },
        undoable: true
      });
      setHistory(historyService.getHistory());
      
      // Handle remaining files if any
      if (fileToSetPrivacy.remainingFiles && fileToSetPrivacy.remainingFiles.length > 0) {
        const [nextFile, ...remainingFiles] = fileToSetPrivacy.remainingFiles
        setFileToSetPrivacy({
          file: nextFile,
          path: fileToSetPrivacy.currentPath || '',
          remainingFiles,
          currentPath: fileToSetPrivacy.currentPath
        })
        setIsPrivacyModalOpen(true)
      } else {
        setIsUploading(false)
        setFileToSetPrivacy(null)
        setIsPrivacyModalOpen(false)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(`Failed to upload ${fileToSetPrivacy.file.name}`)
      setIsUploading(false)
      setFileToSetPrivacy(null)
      setIsPrivacyModalOpen(false)
    }
  }, [fileToSetPrivacy, mutate, setIsUploading, setUploadProgress])

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
    handleDeleteFolder,
    
    // Utilities
    formatSize,
    getDirectoryName,
    
    // Privacy Modal
    isPrivacyModalOpen,
    setIsPrivacyModalOpen,
    fileToSetPrivacy,
    setFileToSetPrivacy,
    handleSetPrivacy,

    // Delete Modal
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    itemToDelete,
    setItemToDelete,
    handleDeleteConfirm,

    // History properties
    history,
    clearHistory,
    undoOperation,
    isHistoryPanelOpen,
    setIsHistoryPanelOpen,

    // Bucket information
    currentBucketName: currentBucket?.name || null,
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
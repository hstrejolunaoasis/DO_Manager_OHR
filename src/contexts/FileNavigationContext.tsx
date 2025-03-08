import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { usePane } from './PaneContext'

export interface FileObject {
  Key: string
  LastModified: Date
  Size: number
  Type: string
}

interface FileNavigationContextType {
  navigateToFolder: (path: string, paneId: string) => void
  handleSearchChange: (query: string, paneId: string) => void
  getFilesForPane: (paneId: string) => FileObject[] | undefined
  formatSize: (bytes: number) => string
  getDirectoryName: (path: string) => string
  mutate: () => Promise<void>
}

const FileNavigationContext = createContext<FileNavigationContextType | undefined>(undefined)

export function FileNavigationProvider({ children }: { children: ReactNode }) {
  const { panes, setTabPath, setTabSearchQuery } = usePane()
  const [filesPerPane, setFilesPerPane] = useState<{ [paneId: string]: FileObject[] }>({})
  const [loadingPanes, setLoadingPanes] = useState<Set<string>>(new Set())

  const getFilesForPane = useCallback((paneId: string) => {
    return filesPerPane[paneId]
  }, [filesPerPane])

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

  const navigateToFolder = useCallback((path: string, paneId: string) => {
    setTabPath(paneId, path)
    fetchFilesForPane(paneId)
  }, [setTabPath, fetchFilesForPane])

  const handleSearchChange = useCallback((query: string, paneId: string) => {
    setTabSearchQuery(paneId, query)
    fetchFilesForPane(paneId)
  }, [setTabSearchQuery, fetchFilesForPane])

  const formatSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  const getDirectoryName = useCallback((path: string) => {
    const parts = path.split('/')
    return parts[parts.length - 2] || path
  }, [])

  const mutate = useCallback(async () => {
    await Promise.all(panes.map(pane => fetchFilesForPane(pane.id)))
  }, [panes, fetchFilesForPane])

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

  const value = {
    navigateToFolder,
    handleSearchChange,
    getFilesForPane,
    formatSize,
    getDirectoryName,
    mutate,
  }

  return (
    <FileNavigationContext.Provider value={value}>
      {children}
    </FileNavigationContext.Provider>
  )
}

export function useFileNavigation() {
  const context = useContext(FileNavigationContext)
  if (context === undefined) {
    throw new Error('useFileNavigation must be used within a FileNavigationProvider')
  }
  return context
} 
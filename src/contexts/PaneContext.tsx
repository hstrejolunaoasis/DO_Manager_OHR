import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

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
  width: number
}

interface PaneContextType {
  panes: PaneState[]
  activePaneId: string
  setActivePaneId: (id: string) => void
  addPane: () => void
  removePane: (id: string) => void
  updatePaneWidth: (id: string, width: number) => void
  moveTabToPane: (tabId: string, fromPaneId: string, toPaneId: string) => void
  getActivePane: () => PaneState
  handleTabClick: (tabId: string) => void
  handleTabClose: (tabId: string) => void
  addNewTab: () => void
  setViewMode: (paneId: string, mode: 'grid' | 'list' | 'tree') => void
}

const PaneContext = createContext<PaneContextType | undefined>(undefined)

export function PaneProvider({ children }: { children: ReactNode }) {
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

  const getActivePane = useCallback(() => {
    return panes.find(p => p.id === activePaneId) || panes[0]
  }, [panes, activePaneId])

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
      if (prevPanes.length === 1) return prevPanes
      
      const remainingPanes = prevPanes.filter(p => p.id !== paneId)
      const newWidth = 100 / remainingPanes.length
      
      return remainingPanes.map(pane => ({
        ...pane,
        width: newWidth
      }))
    })
    
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
      
      if (pane.tabs.length === 1) return pane
      
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

  const setViewMode = useCallback((paneId: string, mode: 'grid' | 'list' | 'tree') => {
    setPanes(prevPanes => prevPanes.map(pane =>
      pane.id === paneId
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
  }, [])

  const value = {
    panes,
    activePaneId,
    setActivePaneId,
    addPane,
    removePane,
    updatePaneWidth,
    moveTabToPane,
    getActivePane,
    handleTabClick,
    handleTabClose,
    addNewTab,
    setViewMode,
  }

  return (
    <PaneContext.Provider value={value}>
      {children}
    </PaneContext.Provider>
  )
}

export function usePane() {
  const context = useContext(PaneContext)
  if (context === undefined) {
    throw new Error('usePane must be used within a PaneProvider')
  }
  return context
} 
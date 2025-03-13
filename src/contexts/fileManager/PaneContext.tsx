'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// Types
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
    const newPaneId = `pane-${panes.length + 1}`
    const newTabId = `tab-${Date.now()}`
    
    setPanes(currentPanes => {
      const totalPanes = currentPanes.length
      const newWidth = 100 / (totalPanes + 1)
      
      return [
        ...currentPanes.map(pane => ({
          ...pane,
          width: newWidth
        })),
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
  }, [panes.length])

  const removePane = useCallback((id: string) => {
    if (panes.length <= 1) return

    setPanes(currentPanes => {
      const remainingPanes = currentPanes.filter(p => p.id !== id)
      const newWidth = 100 / remainingPanes.length
      
      return remainingPanes.map(pane => ({
        ...pane,
        width: newWidth
      }))
    })

    if (activePaneId === id) {
      setActivePaneId(panes[0].id)
    }
  }, [panes, activePaneId])

  const updatePaneWidth = useCallback((id: string, width: number) => {
    setPanes(currentPanes => 
      currentPanes.map(pane =>
        pane.id === id ? { ...pane, width } : pane
      )
    )
  }, [])

  const moveTabToPane = useCallback((tabId: string, fromPaneId: string, toPaneId: string) => {
    setPanes(currentPanes => {
      const fromPane = currentPanes.find(p => p.id === fromPaneId)
      const toPane = currentPanes.find(p => p.id === toPaneId)
      
      if (!fromPane || !toPane) return currentPanes
      
      const tab = fromPane.tabs.find(t => t.id === tabId)
      if (!tab) return currentPanes
      
      return currentPanes.map(pane => {
        if (pane.id === fromPaneId) {
          return {
            ...pane,
            tabs: pane.tabs.filter(t => t.id !== tabId),
            activeTabId: pane.tabs[0]?.id || ''
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
    const pane = panes.find(p => p.tabs.some(t => t.id === tabId))
    if (!pane) return

    setPanes(currentPanes =>
      currentPanes.map(p =>
        p.id === pane.id ? { ...p, activeTabId: tabId } : p
      )
    )
    setActivePaneId(pane.id)
  }, [panes])

  const handleTabClose = useCallback((tabId: string) => {
    setPanes(currentPanes =>
      currentPanes.map(pane => {
        if (!pane.tabs.some(t => t.id === tabId)) return pane

        const newTabs = pane.tabs.filter(t => t.id !== tabId)
        if (newTabs.length === 0) {
          newTabs.push({
            id: 'root',
            path: '',
            label: 'Root',
            searchQuery: '',
            viewMode: 'grid'
          })
        }

        return {
          ...pane,
          tabs: newTabs,
          activeTabId: pane.activeTabId === tabId ? newTabs[0].id : pane.activeTabId
        }
      })
    )
  }, [])

  const addNewTab = useCallback(() => {
    const activePane = getActivePane()
    if (!activePane) return

    const newTabId = `tab-${Date.now()}`
    setPanes(currentPanes =>
      currentPanes.map(pane =>
        pane.id === activePane.id
          ? {
              ...pane,
              tabs: [
                ...pane.tabs,
                {
                  id: newTabId,
                  path: '',
                  label: 'Root',
                  searchQuery: '',
                  viewMode: 'grid'
                }
              ],
              activeTabId: newTabId
            }
          : pane
      )
    )
  }, [getActivePane])

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
    addNewTab
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
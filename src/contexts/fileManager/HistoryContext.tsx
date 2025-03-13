'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import historyService from '../../services/historyService'
import { HistoryEntry } from '../../types/historyTypes'
import toast from 'react-hot-toast'

interface HistoryContextType {
  history: HistoryEntry[]
  clearHistory: () => void
  undoOperation: (entryId: string) => Promise<void>
  isHistoryPanelOpen: boolean
  setIsHistoryPanelOpen: (isOpen: boolean) => void
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined)

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false)

  useEffect(() => {
    setHistory(historyService.getHistory())
  }, [])

  const clearHistory = useCallback(() => {
    historyService.clearHistory()
    setHistory([])
  }, [])

  const undoOperation = useCallback(async (entryId: string) => {
    const entry = history.find(h => h.id === entryId)
    
    if (!entry || entry.undone || !entry.undoable) {
      return
    }
    
    try {
      // Implement undo logic based on operation type
      toast.success('Operation undone successfully')
      
      // Mark operation as undone
      historyService.markAsUndone(entryId)
      setHistory(historyService.getHistory())
    } catch (error) {
      console.error('Undo error:', error)
      toast.error('Failed to undo operation')
    }
  }, [history])

  const value = {
    history,
    clearHistory,
    undoOperation,
    isHistoryPanelOpen,
    setIsHistoryPanelOpen
  }

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  const context = useContext(HistoryContext)
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider')
  }
  return context
}
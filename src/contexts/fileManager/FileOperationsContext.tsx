'use client'

import { createContext, useContext, useCallback, ReactNode } from 'react'
import { FileObject } from '../FileManagerContext'
import toast from 'react-hot-toast'
import historyService from '../../services/historyService'
import { OperationType } from '../../types/historyTypes'

interface FileOperationsContextType {
  // File operations
  handleDelete: (key: string) => Promise<void>
  handleDownload: (key: string) => Promise<void>
  handleCopyUrl: (key: string) => void
  handleCreateFolder: (name: string) => Promise<void>
  handleRename: (newName: string) => Promise<void>
  openRenameModal: (file: FileObject) => void
  handleDeleteFolder: (key: string) => Promise<void>
  handleDeleteConfirm: () => Promise<void>
  handleSetPrivacy: (isPrivate: boolean) => Promise<void>
  
  // Utilities
  formatSize: (bytes: number) => string
  getDirectoryName: (path: string) => string
  
  // Data management
  mutate: () => Promise<void>
}

const FileOperationsContext = createContext<FileOperationsContextType | undefined>(undefined)

export function FileOperationsProvider({ children }: { children: ReactNode }) {
  // Utility functions
  const formatSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  const getDirectoryName = useCallback((path: string) => {
    const parts = path.split('/')
    return parts[parts.length - 2] || 'Root'
  }, [])

  // File operations
  const handleDelete = useCallback(async (key: string) => {
    try {
      const response = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key })
      })

      if (!response.ok) {
        throw new Error('Failed to delete file')
      }

      historyService.addEntry({
        operationType: OperationType.DELETE_FILE,
        details: { key },
        timestamp: new Date(),
        undoable: true
      })

      toast.success('File deleted successfully')
      await mutate()
    } catch (error) {
      console.error('Error deleting file:', error)
      toast.error('Failed to delete file')
    }
  }, [])

  const handleDownload = useCallback(async (key: string) => {
    try {
      const response = await fetch(`/api/files/download?key=${encodeURIComponent(key)}`)
      if (!response.ok) throw new Error('Failed to download file')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = key.split('/').pop() || 'download'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading file:', error)
      toast.error('Failed to download file')
    }
  }, [])

  const handleCopyUrl = useCallback((key: string) => {
    const url = `${process.env.NEXT_PUBLIC_SPACES_URL}/${key}`
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard')
  }, [])

  const handleCreateFolder = useCallback(async (name: string) => {
    try {
      const response = await fetch('/api/folders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      })

      if (!response.ok) {
        throw new Error('Failed to create folder')
      }

      historyService.addEntry({
        operationType: OperationType.CREATE_FOLDER,
        details: { key: name },
        timestamp: new Date(),
        undoable: true
      })

      toast.success('Folder created successfully')
      await mutate()
    } catch (error) {
      console.error('Error creating folder:', error)
      toast.error('Failed to create folder')
    }
  }, [])

  const handleRename = useCallback(async (newName: string) => {
    try {
      const response = await fetch('/api/files/rename', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newName })
      })

      if (!response.ok) {
        throw new Error('Failed to rename file')
      }

      historyService.addEntry({
        operationType: OperationType.RENAME_FILE,
        details: { oldKey: '', newKey: newName }, // oldKey will be set in the component
        timestamp: new Date(),
        undoable: true
      })

      toast.success('File renamed successfully')
      await mutate()
    } catch (error) {
      console.error('Error renaming file:', error)
      toast.error('Failed to rename file')
    }
  }, [])

  const handleDeleteFolder = useCallback(async (key: string) => {
    try {
      const response = await fetch('/api/folders/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key })
      })

      if (!response.ok) {
        throw new Error('Failed to delete folder')
      }

      historyService.addEntry({
        operationType: OperationType.DELETE_FOLDER,
        details: { key },
        timestamp: new Date(),
        undoable: true
      })

      toast.success('Folder deleted successfully')
      await mutate()
    } catch (error) {
      console.error('Error deleting folder:', error)
      toast.error('Failed to delete folder')
    }
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    // This will be implemented in the component using UIStateContext
    // as it needs access to itemToDelete state
  }, [])

  const handleSetPrivacy = useCallback(async (isPrivate: boolean) => {
    // This will be implemented in the component using UIStateContext
    // as it needs access to fileToSetPrivacy state
  }, [])

  const mutate = useCallback(async () => {
    // This will be implemented to refresh the file list
    // It will be connected to the data fetching logic
  }, [])

  const value = {
    handleDelete,
    handleDownload,
    handleCopyUrl,
    handleCreateFolder,
    handleRename,
    openRenameModal: (file: FileObject) => {
      // This will be implemented in the component using UIStateContext
    },
    handleDeleteFolder,
    handleDeleteConfirm,
    handleSetPrivacy,
    formatSize,
    getDirectoryName,
    mutate
  }

  return (
    <FileOperationsContext.Provider value={value}>
      {children}
    </FileOperationsContext.Provider>
  )
}

export function useFileOperations() {
  const context = useContext(FileOperationsContext)
  if (context === undefined) {
    throw new Error('useFileOperations must be used within a FileOperationsProvider')
  }
  return context
}
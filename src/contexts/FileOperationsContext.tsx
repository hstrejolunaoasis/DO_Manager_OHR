import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import toast from 'react-hot-toast'
import { FileObject } from './PaneContext'

interface FileOperationsContextType {
  handleDelete: (key: string) => Promise<void>
  handleDownload: (key: string) => Promise<void>
  handleCopyUrl: (key: string) => void
  handleCreateFolder: (name: string, path: string) => Promise<void>
  handleRename: (newName: string) => Promise<void>
  openRenameModal: (file: FileObject) => void
  fileToRename: FileObject | null
  setFileToRename: (file: FileObject | null) => void
  isNewFolderModalOpen: boolean
  setIsNewFolderModalOpen: (isOpen: boolean) => void
  isRenameModalOpen: boolean
  setIsRenameModalOpen: (isOpen: boolean) => void
}

const FileOperationsContext = createContext<FileOperationsContextType | undefined>(undefined)

export function FileOperationsProvider({ children }: { children: ReactNode }) {
  const [fileToRename, setFileToRename] = useState<FileObject | null>(null)
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false)
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)

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

  const handleCopyUrl = useCallback((key: string) => {
    const cdnUrl = `${process.env.NEXT_PUBLIC_CDN_ENDPOINT}/${key}`
    navigator.clipboard.writeText(cdnUrl)
      .then(() => toast.success('CDN URL copied to clipboard'))
      .catch(() => toast.error('Failed to copy URL'))
  }, [])

  const handleCreateFolder = async (name: string, path: string) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path,
          name,
        }),
      })

      if (!response.ok) throw new Error('Failed to create folder')

      toast.success('Folder created successfully')
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
    } catch (error) {
      toast.error('Failed to rename file')
      console.error('Rename error:', error)
    }
  }

  const openRenameModal = (file: FileObject) => {
    setFileToRename(file)
    setIsRenameModalOpen(true)
  }

  const value = {
    handleDelete,
    handleDownload,
    handleCopyUrl,
    handleCreateFolder,
    handleRename,
    openRenameModal,
    fileToRename,
    setFileToRename,
    isNewFolderModalOpen,
    setIsNewFolderModalOpen,
    isRenameModalOpen,
    setIsRenameModalOpen,
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
'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { FileObject } from '../FileManagerContext'

interface FileToUpload {
  file: File
  path: string
  remainingFiles?: File[]
  currentPath?: string
}

interface UIStateContextType {
  // View state
  gridSize: number
  setGridSize: (size: number) => void
  selectedFile: string | null
  setSelectedFile: (file: string | null) => void
  
  // Modal states
  isNewFolderModalOpen: boolean
  setIsNewFolderModalOpen: (isOpen: boolean) => void
  isRenameModalOpen: boolean
  setIsRenameModalOpen: (isOpen: boolean) => void
  fileToRename: FileObject | null
  setFileToRename: (file: FileObject | null) => void
  isPrivacyModalOpen: boolean
  setIsPrivacyModalOpen: (isOpen: boolean) => void
  fileToSetPrivacy: FileToUpload | null
  setFileToSetPrivacy: (file: FileToUpload | null) => void
  isDeleteModalOpen: boolean
  setIsDeleteModalOpen: (isOpen: boolean) => void
  itemToDelete: { key: string; isDirectory: boolean; itemCount?: number } | null
  setItemToDelete: (item: { key: string; isDirectory: boolean; itemCount?: number } | null) => void
  isHistoryPanelOpen: boolean
  setIsHistoryPanelOpen: (isOpen: boolean) => void
  
  // Upload state
  uploadProgress: { [key: string]: number }
  setUploadProgress: (progress: { [key: string]: number }) => void
  isUploading: boolean
  setIsUploading: (isUploading: boolean) => void
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined)

export function UIStateProvider({ children }: { children: ReactNode }) {
  // View state
  const [gridSize, setGridSize] = useState(200)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  
  // Modal states
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false)
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [fileToRename, setFileToRename] = useState<FileObject | null>(null)
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
  const [fileToSetPrivacy, setFileToSetPrivacy] = useState<FileToUpload | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ key: string; isDirectory: boolean; itemCount?: number } | null>(null)
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false)
  
  // Upload state
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [isUploading, setIsUploading] = useState(false)

  const value = {
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
    isPrivacyModalOpen,
    setIsPrivacyModalOpen,
    fileToSetPrivacy,
    setFileToSetPrivacy,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    itemToDelete,
    setItemToDelete,
    isHistoryPanelOpen,
    setIsHistoryPanelOpen,
    uploadProgress,
    setUploadProgress,
    isUploading,
    setIsUploading
  }

  return (
    <UIStateContext.Provider value={value}>
      {children}
    </UIStateContext.Provider>
  )
}

export function useUIState() {
  const context = useContext(UIStateContext)
  if (context === undefined) {
    throw new Error('useUIState must be used within a UIStateProvider')
  }
  return context
}
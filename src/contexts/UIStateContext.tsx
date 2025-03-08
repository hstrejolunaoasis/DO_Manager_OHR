import { createContext, useContext, useState, ReactNode } from 'react'

interface UIStateContextType {
  gridSize: number
  setGridSize: (size: number) => void
  selectedFile: string | null
  setSelectedFile: (file: string | null) => void
  uploadProgress: { [key: string]: number }
  setUploadProgress: (progress: { [key: string]: number }) => void
  isUploading: boolean
  setIsUploading: (isUploading: boolean) => void
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined)

export function UIStateProvider({ children }: { children: ReactNode }) {
  const [gridSize, setGridSize] = useState(200)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [isUploading, setIsUploading] = useState(false)

  const value = {
    gridSize,
    setGridSize,
    selectedFile,
    setSelectedFile,
    uploadProgress,
    setUploadProgress,
    isUploading,
    setIsUploading,
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
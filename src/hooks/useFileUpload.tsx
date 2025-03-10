import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { useFileManager } from '../contexts/FileManagerContext'

export function useFileUpload() {
  const {
    getActivePane,
    setIsUploading,
    setUploadProgress,
    setIsPrivacyModalOpen,
    setFileToSetPrivacy,
    mutate
  } = useFileManager()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const activePane = getActivePane()
    const activeTab = activePane?.tabs.find(t => t.id === activePane.activeTabId)
    
    if (!activePane || !activeTab) {
      toast.error('No active pane to upload files to')
      return
    }

    // Show privacy modal for the first file
    if (acceptedFiles.length > 0) {
      setFileToSetPrivacy({
        file: acceptedFiles[0],
        path: activeTab.path || '',
        remainingFiles: acceptedFiles.slice(1),
        currentPath: activeTab.path || ''
      })
      setIsPrivacyModalOpen(true)
    }
  }, [getActivePane, setFileToSetPrivacy, setIsPrivacyModalOpen])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return {
    getRootProps,
    getInputProps,
    isDragActive
  }
} 
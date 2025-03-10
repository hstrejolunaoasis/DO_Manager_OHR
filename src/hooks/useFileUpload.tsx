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

    // For each file, show the privacy modal
    acceptedFiles.forEach(file => {
      setFileToSetPrivacy({
        file,
        path: activeTab.path || ''
      })
      setIsPrivacyModalOpen(true)
    })
  }, [getActivePane, setFileToSetPrivacy, setIsPrivacyModalOpen])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return {
    getRootProps,
    getInputProps,
    isDragActive
  }
} 
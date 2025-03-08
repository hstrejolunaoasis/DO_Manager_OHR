import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { usePane } from '../contexts/PaneContext'
import { useUIState } from '../contexts/UIStateContext'
import { useFileNavigation } from '../contexts/FileNavigationContext'

export function useFileUpload() {
  const { getActivePane } = usePane()
  const { setIsUploading, setUploadProgress } = useUIState()
  const { mutate } = useFileNavigation()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const activePane = getActivePane()
    const activeTab = activePane?.tabs.find(t => t.id === activePane.activeTabId)
    
    if (!activePane || !activeTab) {
      toast.error('No active pane to upload files to')
      return
    }

    try {
      setIsUploading(true)
      // Initialize progress for each file
      const initialProgress = acceptedFiles.reduce((acc, file) => {
        acc[file.name] = 0
        return acc
      }, {} as { [key: string]: number })
      setUploadProgress(initialProgress)

      const formData = new FormData()
      acceptedFiles.forEach(file => {
        formData.append('files', file)
      })
      formData.append('path', activeTab.path || '')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      toast.success('Files uploaded successfully')
      setUploadProgress({})
      mutate()
    } catch (error) {
      toast.error('Failed to upload files')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }, [getActivePane, setIsUploading, setUploadProgress, mutate])

  return useDropzone({
    onDrop,
    noClick: false,
    noKeyboard: false,
  })
} 
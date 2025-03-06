import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { useFileManager } from '../contexts/FileManagerContext'

export function useFileUpload() {
  const {
    activeTab,
    setIsUploading,
    setUploadProgress,
    mutate
  } = useFileManager()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
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
      formData.append('path', activeTab?.path || '')

      // Use XMLHttpRequest for upload progress
      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100
            // Update progress for all files
            const updatedProgress = Object.keys(initialProgress).reduce((acc, fileName) => {
              acc[fileName] = progress
              return acc
            }, {} as { [key: string]: number })
            setUploadProgress(updatedProgress)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response)
          } else {
            reject(new Error('Upload failed'))
          }
        }

        xhr.onerror = () => reject(new Error('Upload failed'))
        
        xhr.open('POST', '/api/upload')
        xhr.send(formData)
      })

      toast.success('Files uploaded successfully!')
      // Clear progress after successful upload
      setUploadProgress({})
      mutate()
    } catch (error) {
      toast.error('Failed to upload files')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }, [activeTab?.path, mutate, setIsUploading, setUploadProgress])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return {
    getRootProps,
    getInputProps,
    isDragActive
  }
} 
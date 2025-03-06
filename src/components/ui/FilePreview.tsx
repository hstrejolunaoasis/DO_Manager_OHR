import { DocumentIcon, PhotoIcon, VideoCameraIcon, MusicalNoteIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'

interface FilePreviewProps {
  filename: string
  url?: string
  size?: number
  mode?: 'grid' | 'list'
}

export function FilePreview({ filename, url, size, mode = 'grid' }: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!url) return

    const fetchPreviewUrl = async () => {
      try {
        setIsLoading(true)
        setError(false)
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch preview URL')
        const data = await response.json()
        setPreviewUrl(data.url)
      } catch (err) {
        console.error('Error fetching preview:', err)
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPreviewUrl()
  }, [url])

  const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (!ext) return 'other'

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
    if (['mp4', 'webm', 'mov'].includes(ext)) return 'video'
    if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio'
    return 'other'
  }

  const fileType = getFileType(filename)

  const renderPreview = () => {
    if (fileType === 'image') {
      if (isLoading) {
        return (
          <div className={`${mode === 'grid' ? 'w-full h-32' : 'w-12 h-12'} bg-gray-100 rounded-lg flex items-center justify-center`}>
            <div className="animate-pulse">
              <PhotoIcon className={`${mode === 'grid' ? 'w-12 h-12' : 'w-6 h-6'} text-gray-300`} />
            </div>
          </div>
        )
      }

      if (error || !previewUrl) {
        return (
          <div className={`${mode === 'grid' ? 'w-full h-32' : 'w-12 h-12'} bg-gray-100 rounded-lg flex items-center justify-center`}>
            <PhotoIcon className={`${mode === 'grid' ? 'w-12 h-12' : 'w-6 h-6'} text-gray-400`} />
          </div>
        )
      }

      return (
        <div className={mode === 'grid' ? 'relative w-full pt-[100%]' : 'relative w-12 h-12'}>
          <img
            src={previewUrl}
            alt={filename}
            className={`${
              mode === 'grid'
                ? 'absolute inset-0 w-full h-full object-cover rounded-lg'
                : 'w-full h-full object-cover rounded-md'
            }`}
            onError={(e) => {
              e.currentTarget.src = ''
              e.currentTarget.onerror = null
              e.currentTarget.style.display = 'none'
              const fallback = e.currentTarget.parentElement
              if (fallback) {
                fallback.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg"><svg class="w-6 h-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>'
              }
            }}
          />
        </div>
      )
    }

    const iconClass = mode === 'grid' ? 'w-12 h-12' : 'w-6 h-6'
    return (
      <div className={`${mode === 'grid' ? 'w-full h-32' : 'w-12 h-12'} bg-gray-100 rounded-lg flex items-center justify-center`}>
        {fileType === 'video' && <VideoCameraIcon className={`${iconClass} text-gray-400`} />}
        {fileType === 'audio' && <MusicalNoteIcon className={`${iconClass} text-gray-400`} />}
        {fileType === 'other' && <DocumentIcon className={`${iconClass} text-gray-400`} />}
      </div>
    )
  }

  if (mode === 'list') {
    return renderPreview()
  }

  return (
    <div className="space-y-2">
      {renderPreview()}
      <div className="text-sm font-medium text-gray-900 truncate">
        {filename}
      </div>
    </div>
  )
} 
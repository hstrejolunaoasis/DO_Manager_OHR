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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  const fileType = filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)
    ? 'image'
    : filename.toLowerCase().match(/\.(mp4|webm|mov)$/)
    ? 'video'
    : filename.toLowerCase().match(/\.(mp3|wav|ogg)$/)
    ? 'audio'
    : 'other'

  useEffect(() => {
    if (fileType === 'image' && url) {
      setIsLoading(true)
      setError(false)
      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok')
          return response.url
        })
        .then(url => {
          setPreviewUrl(url)
          setIsLoading(false)
        })
        .catch(() => {
          setError(true)
          setIsLoading(false)
        })
    }
  }, [url, fileType])

  const renderPreview = () => {
    if (fileType === 'image') {
      if (isLoading) {
        return (
          <div className={`${mode === 'grid' ? 'w-full h-32' : 'w-12 h-12'} bg-card dark:bg-accent rounded-lg flex items-center justify-center`}>
            <div className="animate-pulse">
              <PhotoIcon className={`${mode === 'grid' ? 'w-12 h-12' : 'w-6 h-6'} text-text-tertiary`} />
            </div>
          </div>
        )
      }

      if (error || !previewUrl) {
        return (
          <div className={`${mode === 'grid' ? 'w-full h-32' : 'w-12 h-12'} bg-card dark:bg-accent rounded-lg flex items-center justify-center`}>
            <PhotoIcon className={`${mode === 'grid' ? 'w-12 h-12' : 'w-6 h-6'} text-text-tertiary`} />
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
                fallback.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-card dark:bg-accent rounded-lg"><svg class="w-6 h-6 text-text-tertiary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>'
              }
            }}
          />
        </div>
      )
    }

    const iconClass = mode === 'grid' ? 'w-12 h-12' : 'w-6 h-6'
    return (
      <div className={`${mode === 'grid' ? 'w-full h-32' : 'w-12 h-12'} bg-card dark:bg-accent rounded-lg flex items-center justify-center`}>
        {fileType === 'video' && <VideoCameraIcon className={`${iconClass} text-text-tertiary`} />}
        {fileType === 'audio' && <MusicalNoteIcon className={`${iconClass} text-text-tertiary`} />}
        {fileType === 'other' && <DocumentIcon className={`${iconClass} text-text-tertiary`} />}
      </div>
    )
  }

  if (mode === 'list') {
    return renderPreview()
  }

  return (
    <div className="space-y-2">
      {renderPreview()}
      <div className="text-sm font-medium text-text-primary truncate">
        {filename}
      </div>
    </div>
  )
} 
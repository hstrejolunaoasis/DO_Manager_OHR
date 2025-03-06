import { DocumentIcon, PhotoIcon, VideoCameraIcon, MusicalNoteIcon } from '@heroicons/react/24/outline'

interface FilePreviewProps {
  filename: string
  url?: string
  size?: number
}

export function FilePreview({ filename, url, size }: FilePreviewProps) {
  const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (!ext) return 'other'

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image'
    if (['mp4', 'webm', 'mov'].includes(ext)) return 'video'
    if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio'
    return 'other'
  }

  const fileType = getFileType(filename)

  const renderPreview = () => {
    if (!url) {
      return (
        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
          {fileType === 'image' && <PhotoIcon className="w-12 h-12 text-gray-400" />}
          {fileType === 'video' && <VideoCameraIcon className="w-12 h-12 text-gray-400" />}
          {fileType === 'audio' && <MusicalNoteIcon className="w-12 h-12 text-gray-400" />}
          {fileType === 'other' && <DocumentIcon className="w-12 h-12 text-gray-400" />}
        </div>
      )
    }

    switch (fileType) {
      case 'image':
        return (
          <div className="relative w-full pt-[100%]">
            <img
              src={url}
              alt={filename}
              className="absolute inset-0 w-full h-full object-cover rounded-lg"
            />
          </div>
        )
      case 'video':
        return (
          <video
            src={url}
            controls
            className="w-full rounded-lg"
            style={{ maxHeight: '200px' }}
          />
        )
      case 'audio':
        return (
          <audio
            src={url}
            controls
            className="w-full mt-2"
          />
        )
      default:
        return (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <DocumentIcon className="w-12 h-12 text-gray-400" />
          </div>
        )
    }
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
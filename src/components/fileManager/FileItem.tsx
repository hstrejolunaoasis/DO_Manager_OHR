import { 
  PencilIcon, 
  TrashIcon, 
  ArrowDownTrayIcon, 
  LinkIcon 
} from '@heroicons/react/24/outline'
import { useFileManager } from '../../contexts/FileManagerContext'
import { FileObject } from '../../contexts/FileManagerContext'
import { FilePreview } from '../ui/FilePreview'

interface FileItemProps {
  file: FileObject
  viewMode: 'grid' | 'list'
}

export function FileItem({ file, viewMode }: FileItemProps) {
  const { 
    handleDelete, 
    handleDownload, 
    handleCopyUrl, 
    openRenameModal,
    formatSize
  } = useFileManager()

  const fileName = file.Key.split('/').pop() || ''

  if (viewMode === 'grid') {
    return (
      <div 
        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
      >
        <FilePreview
          filename={fileName}
          size={file.Size}
          url={`/api/files/preview?key=${encodeURIComponent(file.Key)}`}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {formatSize(file.Size)}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCopyUrl(file.Key)
              }}
              className="p-1 text-gray-400 hover:text-blue-500"
              title="Copy CDN URL"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                openRenameModal(file)
              }}
              className="p-1 text-gray-400 hover:text-blue-500"
              title="Rename file"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDownload(file.Key)}
              className="p-1 text-gray-400 hover:text-blue-500"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(file.Key)}
              className="p-1 text-gray-400 hover:text-red-500"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border">
      <div className="flex items-center space-x-3">
        <FilePreview
          filename={fileName}
          size={file.Size}
          mode="list"
          url={`/api/files/preview?key=${encodeURIComponent(file.Key)}`}
        />
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleCopyUrl(file.Key)
            }}
            className="text-sm font-medium text-gray-900 hover:text-blue-600"
            title="Copy CDN URL"
          >
            {fileName}
          </button>
          <p className="text-xs text-gray-500">
            {formatSize(file.Size)} • {new Date(file.LastModified).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleCopyUrl(file.Key)
          }}
          className="p-2 text-gray-400 hover:text-blue-500"
          title="Copy CDN URL"
        >
          <LinkIcon className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            openRenameModal(file)
          }}
          className="p-2 text-gray-400 hover:text-blue-500"
          title="Rename file"
        >
          <PencilIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleDownload(file.Key)}
          className="p-2 text-gray-400 hover:text-blue-500"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleDelete(file.Key)}
          className="p-2 text-gray-400 hover:text-red-500"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
} 
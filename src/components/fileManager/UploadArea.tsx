import { CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { useFileManager } from '../../contexts/FileManagerContext'
import { useFileUpload } from '../../hooks/useFileUpload'

interface UploadAreaProps {
  paneId: string
}

export function UploadArea({ paneId }: UploadAreaProps) {
  const { isUploading, uploadProgress, activePaneId } = useFileManager()
  const { getRootProps, getInputProps, isDragActive } = useFileUpload()
  
  const isActivePane = paneId === activePaneId
  const shouldShowProgress = isUploading && isActivePane

  return (
    <div
      {...getRootProps()}
      className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
    >
      <input {...getInputProps()} />
      <CloudArrowUpIcon className={`w-12 h-12 mx-auto ${isUploading ? 'text-blue-500 animate-bounce' : 'text-gray-400'}`} />
      <p className="mt-2 text-sm text-gray-600">
        {isDragActive
          ? 'Drop the files here...'
          : isUploading
          ? 'Uploading files...'
          : 'Drag and drop files here, or click to select files'}
      </p>
      
      {/* Upload Progress - Only show in active pane */}
      {shouldShowProgress && Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-3 max-w-md mx-auto">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="text-left">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span className="truncate">{fileName}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 
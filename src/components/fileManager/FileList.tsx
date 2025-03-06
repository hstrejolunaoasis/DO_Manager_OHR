import { useFileManager } from '../../contexts/FileManagerContext'
import { FileItem } from './FileItem'
import { FileObject } from '../../contexts/FileManagerContext'

interface FileListProps {
  files: FileObject[]
}

export function FileList({ files }: FileListProps) {
  const { viewMode, gridSize, activeTab } = useFileManager()

  if (files.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        {activeTab?.searchQuery ? 'No files match your search' : 'No files in this directory'}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-gray-700">Files</h2>
      <div 
        className={viewMode === 'grid' 
          ? "grid gap-4"
          : "space-y-2"
        }
        style={{
          gridTemplateColumns: viewMode === 'grid' ? `repeat(auto-fill, minmax(${gridSize}px, 1fr))` : '',
        }}
      >
        {files.map((file) => (
          <FileItem 
            key={file.Key} 
            file={file} 
            viewMode={viewMode} 
          />
        ))}
      </div>
    </div>
  )
} 
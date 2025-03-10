import { FolderIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useFileManager } from '../../contexts/FileManagerContext'
import { FileObject } from '../../contexts/FileManagerContext'

interface DirectoryListProps {
  directories: FileObject[]
  paneId: string
}

export function DirectoryList({ directories, paneId }: DirectoryListProps) {
  const { navigateToFolder, getDirectoryName, openRenameModal, viewMode, formatSize } = useFileManager()

  if (directories.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-gray-700">Directories</h2>
      <div 
        className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-2"
        }
      >
        {directories.map((dir) => (
          viewMode === 'grid' ? (
            <div key={dir.Key} className="relative group">
              <button
                onClick={() => navigateToFolder(dir.Key, paneId)}
                className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <FolderIcon className="w-6 h-6 text-blue-500 mr-3" />
                <span className="text-sm font-medium text-gray-900 truncate">
                  {getDirectoryName(dir.Key)}
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openRenameModal(dir);
                }}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Rename directory"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div key={dir.Key} className="relative group flex items-left justify-between p-2 rounded-lg hover:bg-gray-50">
              <div className="flex items-center flex-1 min-w-0">
                <button 
                  onClick={() => navigateToFolder(dir.Key, paneId)}
                  className="flex items-left flex-1 min-w-0"
                >
                  <FolderIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mr-3" />
                  <div className="">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {getDirectoryName(dir.Key)}
                    </div>
                    <p className="text-xs text-gray-500">
                      Directory
                    </p>
                  </div>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openRenameModal(dir);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-500"
                  title="Rename directory"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  )
}
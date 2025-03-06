import { FolderIcon } from '@heroicons/react/24/outline'
import { useFileManager } from '../../contexts/FileManagerContext'
import { FileObject } from '../../contexts/FileManagerContext'

interface DirectoryListProps {
  directories: FileObject[]
}

export function DirectoryList({ directories }: DirectoryListProps) {
  const { navigateToFolder, getDirectoryName } = useFileManager()

  if (directories.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-gray-700">Directories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {directories.map((dir) => (
          <button
            key={dir.Key}
            onClick={() => navigateToFolder(dir.Key)}
            className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
          >
            <FolderIcon className="w-6 h-6 text-blue-500 mr-3" />
            <span className="text-sm font-medium text-gray-900 truncate">
              {getDirectoryName(dir.Key)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
} 
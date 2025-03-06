import { useFileManager } from '../../contexts/FileManagerContext'
import { DirectoryList } from './DirectoryList'
import { FileList } from './FileList'
import { TreeView } from '../ui/TreeView'
import { UploadArea } from './UploadArea'

export function FileContent() {
  const { 
    files, 
    viewMode, 
    activeTab, 
    navigateToFolder, 
    handleDelete, 
    handleDownload, 
    handleCopyUrl, 
    openRenameModal 
  } = useFileManager()

  if (!files) {
    return (
      <div className="flex-1 overflow-y-auto mt-6">
        <div className="text-center text-gray-500 py-4">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Upload area */}
      <UploadArea />

      {/* File List */}
      <div className="flex-1 overflow-y-auto mt-6">
        {viewMode === 'tree' ? (
          <TreeView
            files={files}
            currentPath={activeTab?.path || ''}
            onNavigate={navigateToFolder}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onCopyUrl={handleCopyUrl}
            onRename={openRenameModal}
          />
        ) : (
          <div className="px-4">
            {/* Directories */}
            <DirectoryList 
              directories={files.filter(file => file.Key.endsWith('/'))} 
            />

            {/* Files */}
            <FileList 
              files={files.filter(file => !file.Key.endsWith('/'))} 
            />
          </div>
        )}
      </div>
    </div>
  )
} 
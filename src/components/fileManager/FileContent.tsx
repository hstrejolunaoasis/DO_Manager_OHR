import { useFileManager } from '../../contexts/FileManagerContext'
import { DirectoryList } from './DirectoryList'
import { FileList } from './FileList'
import { TreeView } from '../ui/TreeView'
import { UploadArea } from './UploadArea'

interface FileContentProps {
  paneId: string
}

export function FileContent({ paneId }: FileContentProps) {
  const { 
    getFilesForPane,
    panes,
    activePaneId,
    navigateToFolder, 
    handleDelete, 
    handleDownload, 
    handleCopyUrl, 
    openRenameModal 
  } = useFileManager()

  const pane = panes.find(p => p.id === paneId)
  if (!pane) return null

  const activeTab = pane.tabs.find(t => t.id === pane.activeTabId)
  const isActivePane = paneId === activePaneId
  const files = getFilesForPane(paneId)

  if (!files) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="text-center text-gray-500 py-4">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Show upload area in all panes, but only make it active in the focused pane */}
      <div className={`transition-opacity duration-200 ${!isActivePane ? 'opacity-50 pointer-events-none' : ''}`}>
        <UploadArea paneId={paneId} />
      </div>

      {/* File List - Scrollable container */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab?.viewMode === 'tree' ? (
          <TreeView
            files={files}
            currentPath={activeTab?.path || ''}
            onNavigate={(path) => navigateToFolder(path, paneId)}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onCopyUrl={handleCopyUrl}
            onRename={openRenameModal}
          />
        ) : (
          <div className="px-4 py-6">
            {/* Directories */}
            <DirectoryList 
              directories={files.filter(file => file.Key.endsWith('/'))}
              paneId={paneId}
            />

            {/* Files */}
            <FileList 
              files={files.filter(file => !file.Key.endsWith('/'))}
              paneId={paneId}
            />
          </div>
        )}
      </div>
    </div>
  )
} 
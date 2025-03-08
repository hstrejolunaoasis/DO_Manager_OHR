import { usePane } from '../../contexts/PaneContext'
import { useUIState } from '../../contexts/UIStateContext'
import { FileItem } from './FileItem'
import { FileObject } from '../../contexts/PaneContext'

interface FileListProps {
  files: FileObject[]
  paneId: string
}

export function FileList({ files, paneId }: FileListProps) {
  const { panes } = usePane()
  const { gridSize } = useUIState()

  const pane = panes.find(p => p.id === paneId)
  const activeTab = pane?.tabs.find(t => t.id === pane.activeTabId)
  const viewMode = activeTab?.viewMode || 'grid'

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
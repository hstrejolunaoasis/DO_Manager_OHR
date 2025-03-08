import { FolderIcon, FolderPlusIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { usePane } from '../../contexts/PaneContext'
import { useFileOperations } from '../../contexts/FileOperationsContext'
import { useFileNavigation } from '../../contexts/FileNavigationContext'
import { useUIState } from '../../contexts/UIStateContext'
import { SearchBar } from '../ui/SearchBar'
import { ViewSelector } from '../ui/ViewSelector'
import { GridSizeControl } from '../ui/GridSizeControl'
import { TabBar } from '../ui/TabBar'
import { Tooltip } from '../ui/Tooltip'

interface TopBarProps {
  paneId: string
  onTabDragStart: (tabId: string, fromPaneId: string) => void
  onTabDragEnd: () => void
  canClose: boolean
  onClose: () => void
}

export function TopBar({
  paneId,
  onTabDragStart,
  onTabDragEnd,
  canClose,
  onClose
}: TopBarProps) {
  const {
    panes,
    activePaneId,
    handleTabClick,
    handleTabClose,
    addNewTab,
    setViewMode,
  } = usePane()
  const { setIsNewFolderModalOpen } = useFileOperations()
  const { navigateToFolder, handleSearchChange } = useFileNavigation()
  const { gridSize, setGridSize } = useUIState()

  const pane = panes.find(p => p.id === paneId)
  if (!pane) return null

  const activeTab = pane.tabs.find(t => t.id === pane.activeTabId)
  const isActivePane = paneId === activePaneId

  return (
    <div className="p-4 border-b space-y-4">
      {/* Tabs and pane controls - always active */}
      <div className="flex items-center space-x-2">
        <TabBar
          tabs={pane.tabs}
          activeTabId={pane.activeTabId}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
          onDragStart={onTabDragStart}
          onDragEnd={onTabDragEnd}
          paneId={paneId}
        />
        <Tooltip content="Open new tab" position="bottom">
          <button
            onClick={addNewTab}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </Tooltip>
        {canClose && (
          <Tooltip content="Close pane" position="bottom">
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-red-500"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Controls that become inactive in non-active panes */}
      <div className={`space-y-4 transition-opacity duration-200 ${!isActivePane ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Breadcrumb navigation */}
        <nav className="flex space-x-2 items-center">
          <button
            onClick={() => navigateToFolder('', paneId)}
            className="text-blue-600 hover:underline flex items-center"
          >
            <FolderIcon className="w-5 h-5 mr-1" />
            Root
          </button>
          {activeTab?.path.split('/').filter(Boolean).map((segment, index, array) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-gray-500">/</span>
              <button
                onClick={() => navigateToFolder(array.slice(0, index + 1).join('/') + '/', paneId)}
                className="text-blue-600 hover:underline flex items-center"
              >
                <FolderIcon className="w-5 h-5 mr-1" />
                {segment}
              </button>
            </div>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <SearchBar
              value={activeTab?.searchQuery || ''}
              onChange={(query) => handleSearchChange(query, paneId)}
            />
          </div>
          <button
            onClick={() => setIsNewFolderModalOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FolderPlusIcon className="h-5 w-5 mr-1" />
            New Folder
          </button>
          {activeTab?.viewMode === 'grid' && (
            <GridSizeControl
              value={gridSize}
              onChange={setGridSize}
            />
          )}
          <ViewSelector
            currentView={activeTab?.viewMode || 'grid'}
            onViewChange={(mode) => setViewMode(paneId, mode)}
          />
        </div>
      </div>
    </div>
  )
} 
import { FolderIcon, FolderPlusIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useFileManager } from '../../contexts/FileManagerContext'
import { SearchBar } from '../ui/SearchBar'
import { ViewSelector } from '../ui/ViewSelector'
import { GridSizeControl } from '../ui/GridSizeControl'
import { TabBar } from '../ui/TabBar'

export function TopBar() {
  const {
    tabs,
    activeTabId,
    activeTab,
    handleTabClick,
    handleTabClose,
    addNewTab,
    navigateToFolder,
    handleSearchChange,
    setIsNewFolderModalOpen,
    viewMode,
    setViewMode,
    gridSize,
    setGridSize
  } = useFileManager()

  return (
    <div className="p-4 border-b space-y-4">
      {/* Tabs */}
      <div className="flex items-center space-x-2">
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
        />
        <button
          onClick={addNewTab}
          className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
          title="New tab"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Breadcrumb navigation */}
      <nav className="flex space-x-2 items-center">
        <button
          onClick={() => navigateToFolder('')}
          className="text-blue-600 hover:underline flex items-center"
        >
          <FolderIcon className="w-5 h-5 mr-1" />
          Root
        </button>
        {activeTab?.path.split('/').filter(Boolean).map((segment, index, array) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="text-gray-500">/</span>
            <button
              onClick={() => navigateToFolder(array.slice(0, index + 1).join('/') + '/')}
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
            onChange={handleSearchChange}
          />
        </div>
        <button
          onClick={() => setIsNewFolderModalOpen(true)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FolderPlusIcon className="h-5 w-5 mr-1" />
          New Folder
        </button>
        {viewMode === 'grid' && (
          <GridSizeControl
            value={gridSize}
            onChange={setGridSize}
          />
        )}
        <ViewSelector
          currentView={viewMode}
          onViewChange={setViewMode}
        />
      </div>
    </div>
  )
} 
import { Squares2X2Icon, ListBulletIcon, ViewColumnsIcon } from '@heroicons/react/24/outline'
import { Tooltip } from './Tooltip'

interface ViewSelectorProps {
  currentView: 'grid' | 'list' | 'tree'
  onViewChange: (view: 'grid' | 'list' | 'tree') => void
}

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      <Tooltip content="Display files as a grid of thumbnails with previews">
        <button
          onClick={() => onViewChange('grid')}
          className={`p-2 rounded-md ${
            currentView === 'grid'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <Squares2X2Icon className="w-5 h-5" />
        </button>
      </Tooltip>
      <Tooltip content="Show files in a detailed list with additional information">
        <button
          onClick={() => onViewChange('list')}
          className={`p-2 rounded-md ${
            currentView === 'list'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <ListBulletIcon className="w-5 h-5" />
        </button>
      </Tooltip>
      <Tooltip content="Browse files and folders in a hierarchical structure">
        <button
          onClick={() => onViewChange('tree')}
          className={`p-2 rounded-md ${
            currentView === 'tree'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <ViewColumnsIcon className="w-5 h-5" />
        </button>
      </Tooltip>
    </div>
  )
} 
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline'
import { Tooltip } from './Tooltip'

interface ViewSelectorProps {
  currentView: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
}

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      <Tooltip content="Grid with thumbnails">
        <button
          onClick={() => onViewChange('grid')}
          className={`p-2 rounded-md ${
            currentView === 'grid'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
          aria-label="Grid view"
        >
          <Squares2X2Icon className="w-5 h-5" />
        </button>
      </Tooltip>
      <Tooltip content="Detailed list">
        <button
          onClick={() => onViewChange('list')}
          className={`p-2 rounded-md ${
            currentView === 'list'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
          aria-label="List view"
        >
          <ListBulletIcon className="w-5 h-5" />
        </button>
      </Tooltip>
    </div>
  )
}
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline'

type ViewMode = 'grid' | 'list'

interface ViewSelectorProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
}

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  return (
    <div className="flex bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => onViewChange('grid')}
        className={`p-2 rounded-md ${
          currentView === 'grid'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Squares2X2Icon className="h-5 w-5" />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`p-2 rounded-md ${
          currentView === 'list'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <ListBulletIcon className="h-5 w-5" />
      </button>
    </div>
  )
} 
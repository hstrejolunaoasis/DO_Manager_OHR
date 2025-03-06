import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline'

type ViewMode = 'grid' | 'list'

interface ViewSelectorProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
}

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  return (
    <div className="flex bg-card dark:bg-accent p-1 rounded-lg border border-border">
      <button
        onClick={() => onViewChange('grid')}
        className={`p-2 rounded-md ${
          currentView === 'grid'
            ? 'bg-white dark:bg-card text-primary shadow-sm'
            : 'text-text-tertiary hover:text-text-secondary'
        }`}
      >
        <Squares2X2Icon className="h-5 w-5" />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`p-2 rounded-md ${
          currentView === 'list'
            ? 'bg-white dark:bg-card text-primary shadow-sm'
            : 'text-text-tertiary hover:text-text-secondary'
        }`}
      >
        <ListBulletIcon className="h-5 w-5" />
      </button>
    </div>
  )
} 
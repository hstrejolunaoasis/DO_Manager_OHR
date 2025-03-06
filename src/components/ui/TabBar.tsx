import { FolderIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface TabBarProps {
  tabs: Array<{
    id: string
    label: string
  }>
  activeTabId: string | null
  onTabClick: (id: string) => void
  onTabClose: (id: string) => void
}

export function TabBar({ tabs, activeTabId, onTabClick, onTabClose }: TabBarProps) {
  if (tabs.length === 0) return null

  return (
    <div className="flex space-x-1 overflow-x-auto bg-card dark:bg-accent border-b border-border px-2 py-2">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId
        return (
          <div
            key={tab.id}
            className={`
              group flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium
              cursor-pointer transition-colors min-w-[120px] max-w-[200px]
              ${isActive 
                ? 'bg-white dark:bg-card text-primary shadow-sm border border-border' 
                : 'text-text-secondary hover:bg-card-hover dark:hover:bg-accent'
              }
            `}
          >
            <button
              className="flex items-center space-x-2 flex-1 min-w-0"
              onClick={() => onTabClick(tab.id)}
            >
              <FolderIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{tab.label || 'Root'}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onTabClose(tab.id)
              }}
              className={`
                flex-shrink-0 p-0.5 rounded-full
                ${isActive 
                  ? 'text-primary hover:text-primary-hover' 
                  : 'text-text-tertiary hover:text-text-secondary'
                }
              `}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
} 
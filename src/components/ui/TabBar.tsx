import { XMarkIcon, FolderIcon } from '@heroicons/react/24/outline'

export interface Tab {
  id: string
  path: string
  label: string
}

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string
  onTabClick: (tabId: string) => void
  onTabClose: (tabId: string) => void
}

export function TabBar({ tabs, activeTabId, onTabClick, onTabClose }: TabBarProps) {
  if (tabs.length === 0) return null

  return (
    <div className="flex space-x-1 overflow-x-auto bg-gray-50 border-b px-2 py-2">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId
        return (
          <div
            key={tab.id}
            className={`
              group flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium
              cursor-pointer transition-colors min-w-[120px] max-w-[200px]
              ${isActive 
                ? 'bg-white text-blue-600 shadow-sm border border-gray-200' 
                : 'text-gray-600 hover:bg-gray-100'
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
                  ? 'text-blue-400 hover:text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
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
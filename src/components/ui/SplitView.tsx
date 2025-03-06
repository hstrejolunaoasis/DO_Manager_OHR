import { useState } from 'react'
import { ViewColumnsIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface SplitViewProps {
  tabs: Array<{
    id: string
    label: string
    content: React.ReactNode
  }>
  activeTabIds: string[]
  onTabClick: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onSplitChange: (activeIds: string[]) => void
  onTabDragEnd: (tabId: string, targetSplitIndex: number) => void
}

export function SplitView({
  tabs,
  activeTabIds,
  onTabClick,
  onTabClose,
  onSplitChange,
  onTabDragEnd
}: SplitViewProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    e.dataTransfer.setData('text/plain', tabId)
    setIsDragging(true)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, splitIndex: number) => {
    e.preventDefault()
    const tabId = e.dataTransfer.getData('text/plain')
    onTabDragEnd(tabId, splitIndex)
    setIsDragging(false)
  }

  const handleAddSplit = () => {
    if (activeTabIds.length < 3 && tabs.length > activeTabIds.length) {
      // Find the first inactive tab
      const availableTab = tabs.find(tab => !activeTabIds.includes(tab.id))
      if (availableTab) {
        onSplitChange([...activeTabIds, availableTab.id])
      }
    }
  }

  return (
    <div className="flex-1 flex">
      {/* Split panels */}
      <div className="flex-1 flex">
        {activeTabIds.map((tabId, index) => {
          const tab = tabs.find(t => t.id === tabId)
          if (!tab) return null

          return (
            <div
              key={tabId}
              className="flex-1 border-r last:border-r-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              {/* Panel header */}
              <div
                className="flex items-center justify-between p-2 bg-gray-50 border-b"
                draggable
                onDragStart={(e) => handleDragStart(e, tabId)}
              >
                <span className="text-sm font-medium truncate">{tab.label}</span>
                <button
                  onClick={() => onTabClose(tabId)}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              {/* Panel content */}
              <div className="h-full">
                {tab.content}
              </div>
            </div>
          )
        })}
      </div>

      {/* Split control */}
      {activeTabIds.length < 3 && tabs.length > activeTabIds.length && (
        <button
          onClick={handleAddSplit}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 border-l"
          title="Add split view"
        >
          <ViewColumnsIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  )
} 
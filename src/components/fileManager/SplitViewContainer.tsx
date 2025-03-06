import React, { useRef, useState } from 'react'
import { useFileManager } from '../../contexts/FileManagerContext'
import { TopBar } from './TopBar'
import { FileContent } from './FileContent'

interface DragState {
  isDragging: boolean
  draggedTabId: string | null
  draggedFromPaneId: string | null
  dropPreviewPaneId: string | null
  dropPreviewPosition: 'left' | 'right' | 'current' | null
}

export function SplitViewContainer() {
  const {
    panes,
    activePaneId,
    setActivePaneId,
    updatePaneWidth,
    moveTabToPane,
    addPane,
    removePane
  } = useFileManager()

  const containerRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<{ paneId: string; startX: number; startWidth: number } | null>(null)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedTabId: null,
    draggedFromPaneId: null,
    dropPreviewPaneId: null,
    dropPreviewPosition: null
  })

  // Handle mouse events for resizing
  const handleMouseDown = (e: React.MouseEvent, paneId: string, currentWidth: number) => {
    e.preventDefault()
    resizeRef.current = {
      paneId,
      startX: e.clientX,
      startWidth: currentWidth
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!resizeRef.current || !containerRef.current) return

    const { paneId, startX, startWidth } = resizeRef.current
    const containerWidth = containerRef.current.offsetWidth
    const deltaX = e.clientX - startX
    const newWidth = Math.max(20, Math.min(80, (startWidth + (deltaX / containerWidth) * 100)))

    updatePaneWidth(paneId, newWidth)
  }

  const handleMouseUp = () => {
    resizeRef.current = null
  }

  // Handle drag and drop for tabs
  const handleTabDragStart = (tabId: string, fromPaneId: string) => {
    setDragState({
      isDragging: true,
      draggedTabId: tabId,
      draggedFromPaneId: fromPaneId,
      dropPreviewPaneId: null,
      dropPreviewPosition: null
    })
  }

  const handleTabDragOver = (e: React.DragEvent, paneId: string) => {
    e.preventDefault()
    if (!dragState.isDragging || !containerRef.current) return

    const paneRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const mouseX = e.clientX - paneRect.left
    const paneWidth = paneRect.width
    const position = mouseX < paneWidth / 3 ? 'left'
      : mouseX > (paneWidth * 2) / 3 ? 'right'
      : 'current'

    setDragState(prev => ({
      ...prev,
      dropPreviewPaneId: paneId,
      dropPreviewPosition: position
    }))
  }

  const handleTabDrop = (e: React.DragEvent, targetPaneId: string) => {
    e.preventDefault()
    const { draggedTabId, draggedFromPaneId, dropPreviewPosition } = dragState
    if (!draggedTabId || !draggedFromPaneId) return

    if (dropPreviewPosition === 'left' || dropPreviewPosition === 'right') {
      // Create new pane
      const newPaneId = `pane-${Date.now()}`
      addPane()
      moveTabToPane(draggedTabId, draggedFromPaneId, newPaneId)
    } else {
      // Move to existing pane
      moveTabToPane(draggedTabId, draggedFromPaneId, targetPaneId)
    }

    setDragState({
      isDragging: false,
      draggedTabId: null,
      draggedFromPaneId: null,
      dropPreviewPaneId: null,
      dropPreviewPosition: null
    })
  }

  const handleTabDragEnd = () => {
    setDragState({
      isDragging: false,
      draggedTabId: null,
      draggedFromPaneId: null,
      dropPreviewPaneId: null,
      dropPreviewPosition: null
    })
  }

  return (
    <div
      ref={containerRef}
      className="h-full flex"
      onMouseMove={handleMouseMove as any}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {panes.map((pane, index) => (
        <React.Fragment key={pane.id}>
          <div
            className={`flex-1 flex flex-col ${
              dragState.dropPreviewPaneId === pane.id
                ? 'relative'
                : ''
            }`}
            style={{ width: `${pane.width}%` }}
            onClick={() => setActivePaneId(pane.id)}
            onDragOver={(e) => handleTabDragOver(e, pane.id)}
            onDrop={(e) => handleTabDrop(e, pane.id)}
          >
            {/* Drop preview overlay */}
            {dragState.dropPreviewPaneId === pane.id && (
              <>
                {dragState.dropPreviewPosition === 'left' && (
                  <div className="absolute inset-0 w-1/3 bg-blue-200 bg-opacity-30 border-2 border-blue-400 rounded-lg z-10" />
                )}
                {dragState.dropPreviewPosition === 'right' && (
                  <div className="absolute right-0 inset-y-0 w-1/3 bg-blue-200 bg-opacity-30 border-2 border-blue-400 rounded-lg z-10" />
                )}
                {dragState.dropPreviewPosition === 'current' && (
                  <div className="absolute inset-0 bg-blue-200 bg-opacity-30 border-2 border-blue-400 rounded-lg z-10" />
                )}
              </>
            )}

            {/* Pane content */}
            <div className={`flex-1 flex flex-col ${
              activePaneId === pane.id ? 'ring-2 ring-blue-500' : ''
            }`}>
              <TopBar
                paneId={pane.id}
                onTabDragStart={handleTabDragStart}
                onTabDragEnd={handleTabDragEnd}
                canClose={panes.length > 1}
                onClose={() => removePane(pane.id)}
              />
              <FileContent paneId={pane.id} />
            </div>

            {/* Resize handle */}
            {index < panes.length - 1 && (
              <div
                className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize"
                onMouseDown={(e) => handleMouseDown(e, pane.id, pane.width)}
              />
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  )
} 
import React, { useState } from 'react'
import {
  ChevronRightIcon,
  FolderIcon,
  DocumentIcon,
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  LinkIcon,
} from '@heroicons/react/24/outline'
import { FileObject } from '@/types/files'

interface TreeItemProps {
  item: FileObject
  files: FileObject[]
  level: number
  currentPath: string
  onNavigate: (path: string) => void
  onDelete: (key: string) => void
  onDownload: (key: string) => void
  onCopyUrl: (key: string) => void
  onRename: (file: FileObject) => void
}

const TreeItem: React.FC<TreeItemProps> = ({
  item,
  files,
  level,
  currentPath,
  onNavigate,
  onDelete,
  onDownload,
  onCopyUrl,
  onRename,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isFolder = item.Key.endsWith('/')
  const isCurrentItem = currentPath === item.Key
  const itemName = item.Key.split('/').filter(Boolean).pop() || 'Root'

  const childItems = isFolder ? files.filter(file => {
    if (file.Key === item.Key) return false
    if (!file.Key.startsWith(item.Key)) return false
    const relativePath = file.Key.slice(item.Key.length)
    const segments = relativePath.split('/').filter(Boolean)
    return segments.length === 1 || (segments.length === 1 && file.Key.endsWith('/'))
  }) : []

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleItemClick = (e: React.MouseEvent) => {
    if (isFolder && !e.defaultPrevented) {
      onNavigate(item.Key)
    }
  }

  const FileActions = () => (
    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onCopyUrl(item.Key)
        }}
        className="p-1 rounded hover:bg-gray-200 text-gray-500"
        title="Copy URL"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRename(item)
        }}
        className="p-1 rounded hover:bg-gray-200 text-gray-500"
        title="Rename"
      >
        <PencilIcon className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDownload(item.Key)
        }}
        className="p-1 rounded hover:bg-gray-200 text-gray-500"
        title="Download"
      >
        <ArrowDownTrayIcon className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(item.Key)
        }}
        className="p-1 rounded hover:bg-gray-200 text-gray-500"
        title="Delete"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  )

  return (
    <div className="select-none text-gray-800">
      <div
        className={`group flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-gray-50 ${
          isCurrentItem ? 'bg-blue-50' : ''
        }`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={handleItemClick}
      >
        {isFolder ? (
          <button
            onClick={handleToggle}
            className="p-1 rounded-md hover:bg-gray-200 mr-1"
          >
            <ChevronRightIcon
              className={`w-4 h-4 text-gray-500 transition-transform ${
                isExpanded ? 'transform rotate-90' : ''
              }`}
            />
          </button>
        ) : (
          <div className="w-6" /> // Spacer for alignment
        )}
        
        {isFolder ? (
          <FolderIcon 
            className={`w-5 h-5 ${isCurrentItem ? 'text-blue-500' : 'text-gray-400'} mr-2`} 
          />
        ) : (
          <DocumentIcon className="w-5 h-5 text-gray-400 mr-2" />
        )}
        
        <span className="flex-1 truncate text-sm">{itemName}</span>

        {!isFolder && <FileActions />}
      </div>

      {isFolder && isExpanded && (
        <div className="ml-4">
          {childItems.map((child) => (
            <TreeItem
              key={child.Key}
              item={child}
              files={files}
              level={level + 1}
              currentPath={currentPath}
              onNavigate={onNavigate}
              onDelete={onDelete}
              onDownload={onDownload}
              onCopyUrl={onCopyUrl}
              onRename={onRename}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TreeViewProps {
  files: FileObject[]
  currentPath: string
  onNavigate: (path: string) => void
  onDelete: (key: string) => void
  onDownload: (key: string) => void
  onCopyUrl: (key: string) => void
  onRename: (file: FileObject) => void
}

export const TreeView: React.FC<TreeViewProps> = ({
  files,
  currentPath,
  onNavigate,
  onDelete,
  onDownload,
  onCopyUrl,
  onRename
}) => {
  const rootItems = files.filter(file => {
    if (!currentPath) {
      return !file.Key.includes('/') || (file.Key.match(/\//g) || []).length === 1
    }
    return file.Key.startsWith(currentPath) && 
           file.Key !== currentPath &&
           !file.Key.slice(currentPath.length).includes('/')
  })

  return (
    <div className="p-4">
      {rootItems.map((item) => (
        <TreeItem
          key={item.Key}
          item={item}
          files={files}
          level={0}
          currentPath={currentPath}
          onNavigate={onNavigate}
          onDelete={onDelete}
          onDownload={onDownload}
          onCopyUrl={onCopyUrl}
          onRename={onRename}
        />
      ))}
    </div>
  )
} 
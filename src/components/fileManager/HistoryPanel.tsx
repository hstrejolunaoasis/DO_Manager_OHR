import React from 'react';
import { 
  ArrowUturnLeftIcon, 
  TrashIcon, 
  XMarkIcon, 
  FolderPlusIcon,
  DocumentPlusIcon,
  PencilIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { useFileManager } from '../../contexts/FileManagerContext';
import { OperationType } from '../../types/historyTypes';
import { formatDistanceToNow } from 'date-fns';

export function HistoryPanel() {
  const { 
    history, 
    isHistoryPanelOpen, 
    setIsHistoryPanelOpen,
    clearHistory,
    undoOperation 
  } = useFileManager();

  if (!isHistoryPanelOpen) return null;

  const getOperationIcon = (operationType: OperationType) => {
    switch (operationType) {
      case OperationType.CREATE_FOLDER:
        return <FolderPlusIcon className="h-5 w-5 text-blue-500" />;
      case OperationType.UPLOAD_FILE:
        return <DocumentPlusIcon className="h-5 w-5 text-green-500" />;
      case OperationType.DELETE_FILE:
      case OperationType.DELETE_FOLDER:
        return <TrashIcon className="h-5 w-5 text-red-500" />;
      case OperationType.RENAME_FILE:
      case OperationType.RENAME_FOLDER:
        return <PencilIcon className="h-5 w-5 text-amber-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getOperationText = (entry: any) => {
    const fileName = entry.details.key?.split('/').pop() || 
                    entry.details.newKey?.split('/').pop() || 
                    entry.details.name || 'Unknown';
    
    switch (entry.operationType) {
      case OperationType.CREATE_FOLDER:
        return `Created folder "${entry.details.name}"`;
      case OperationType.UPLOAD_FILE:
        return `Uploaded "${fileName}"`;
      case OperationType.DELETE_FILE:
        return `Deleted file "${fileName}"`;
      case OperationType.DELETE_FOLDER:
        return `Deleted folder "${fileName}"`;
      case OperationType.RENAME_FILE: {
        const oldName = entry.details.oldKey?.split('/').pop() || '';
        const newName = entry.details.newKey?.split('/').pop() || '';
        return `Renamed file from "${oldName}" to "${newName}"`;
      }
      case OperationType.RENAME_FOLDER: {
        const oldName = entry.details.oldKey?.split('/').pop() || '';
        const newName = entry.details.newKey?.split('/').pop() || '';
        return `Renamed folder from "${oldName}" to "${newName}"`;
      }
      default:
        return 'Unknown operation';
    }
  };

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg z-40 border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold flex items-center">
          <ClockIcon className="h-5 w-5 mr-2" />
          Activity History
        </h2>
        <button 
          onClick={() => setIsHistoryPanelOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4">
        {history.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            No history available
          </div>
        ) : (
          <ul className="space-y-3">
            {history.map((entry) => (
              <li 
                key={entry.id} 
                className={`p-3 border rounded-md ${
                  entry.undone ? 'bg-gray-100 text-gray-400' : 'bg-white'
                }`}
              >
                <div className="flex justify-between">
                  <div className="flex items-start space-x-2">
                    {getOperationIcon(entry.operationType)}
                    <div>
                      <div className="text-sm">
                        {getOperationText(entry)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  
                  {entry.undoable && !entry.undone && (
                    <button 
                      onClick={() => undoOperation(entry.id)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Undo this operation"
                    >
                      <ArrowUturnLeftIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      {history.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <button 
            onClick={clearHistory}
            className="flex items-center justify-center w-full px-4 py-2 text-sm text-red-500 border border-red-500 rounded-md hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Clear History
          </button>
        </div>
      )}
    </div>
  );
}

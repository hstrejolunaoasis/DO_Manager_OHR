export enum OperationType {
  CREATE_FOLDER = 'CREATE_FOLDER',
  DELETE_FILE = 'DELETE_FILE',
  DELETE_FOLDER = 'DELETE_FOLDER',
  RENAME_FILE = 'RENAME_FILE',
  RENAME_FOLDER = 'RENAME_FOLDER',
  UPLOAD_FILE = 'UPLOAD_FILE'
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  operationType: OperationType;
  details: {
    key?: string;         // File/folder path
    oldKey?: string;      // For rename operations
    newKey?: string;      // For rename operations
    name?: string;        // For create folder
    size?: number;        // For files
    isDirectory: boolean;
  };
  undoable: boolean;      // Whether this operation can be undone
  undone: boolean;        // Whether this operation has been undone
}

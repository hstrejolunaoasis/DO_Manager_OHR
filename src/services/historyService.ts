import { HistoryEntry, OperationType } from '../types/historyTypes';

// Maximum number of history entries to keep
const MAX_HISTORY_ENTRIES = 100;

export class HistoryService {
  private static instance: HistoryService;
  private history: HistoryEntry[] = [];
  
  private constructor() {}
  
  public static getInstance(): HistoryService {
    if (!HistoryService.instance) {
      HistoryService.instance = new HistoryService();
    }
    return HistoryService.instance;
  }
  
  public getHistory(): HistoryEntry[] {
    return [...this.history];
  }
  
  public addEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp' | 'undone'>): HistoryEntry {
    const newEntry: HistoryEntry = {
      ...entry,
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      undone: false
    };
    
    // Add to the beginning of the array
    this.history.unshift(newEntry);
    
    // Limit history size
    if (this.history.length > MAX_HISTORY_ENTRIES) {
      this.history = this.history.slice(0, MAX_HISTORY_ENTRIES);
    }
    
    return newEntry;
  }
  
  public markAsUndone(entryId: string): void {
    const entry = this.history.find(entry => entry.id === entryId);
    if (entry) {
      entry.undone = true;
    }
  }
  
  public clearHistory(): void {
    this.history = [];
  }
}

export default HistoryService.getInstance();

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { VocabularyItem } from '../lib/types';

interface OfflineDBSchema extends DBSchema {
  vocabulary: {
    key: string;
    value: {
      id: string;
      ko: string;
      vi: string;
      level?: number;
      category?: string;
      lastSynced: number;
      isDeleted: boolean;
    };
    indexes: {
      category: string;
      level: number;
      lastSynced: number;
    };
  };
  progress: {
    key: string;
    value: {
      id: string;
      wordId: string;
      lastReviewed: number;
      easeFactor: number;
      interval: number;
      repetitions: number;
      dueDate: number;
      lastSynced: number;
    };
    indexes: {
      wordId: string;
      dueDate: number;
      lastSynced: number;
    };
  };
  gameResults: {
    key: string;
    value: {
      id: string;
      gameType: string;
      score: number;
      correctAnswers: number;
      totalQuestions: number;
      timeSpent: number;
      timestamp: number;
      lastSynced: number;
    };
    indexes: {
      gameType: string;
      timestamp: number;
      lastSynced: number;
    };
  };
  settings: {
    key: string;
    value: {
      key: string;
      value: any;
      lastSynced: number;
    };
    indexes: {
      lastSynced: number;
    };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      type: 'vocabulary' | 'progress' | 'gameResult' | 'setting';
      operation: 'create' | 'update' | 'delete';
      data: any;
      timestamp: number;
      retryCount: number;
    };
    indexes: {
      type: string;
      timestamp: number;
    };
  };
}

class OfflineStorageManager {
  private db: IDBPDatabase<OfflineDBSchema> | null = null;
  private isOnline: boolean = true;

  constructor() {
    this.init();
    this.setupOnlineOfflineHandlers();
  }

  private async init() {
    try {
      this.db = await openDB<OfflineDBSchema>('topik-offline-db', 1, {
        upgrade(db) {
          // Vocabulary store
          const vocabularyStore = db.createObjectStore('vocabulary', {
            keyPath: 'id'
          });
          vocabularyStore.createIndex('category', 'category');
          vocabularyStore.createIndex('level', 'level');
          vocabularyStore.createIndex('lastSynced', 'lastSynced');

          // Progress store  
          const progressStore = db.createObjectStore('progress', {
            keyPath: 'id'
          });
          progressStore.createIndex('wordId', 'wordId');
          progressStore.createIndex('dueDate', 'dueDate');
          progressStore.createIndex('lastSynced', 'lastSynced');

          // Game results store
          const gameResultsStore = db.createObjectStore('gameResults', {
            keyPath: 'id'
          });
          gameResultsStore.createIndex('gameType', 'gameType');
          gameResultsStore.createIndex('timestamp', 'timestamp');
          gameResultsStore.createIndex('lastSynced', 'lastSynced');

          // Settings store
          const settingsStore = db.createObjectStore('settings', {
            keyPath: 'key'
          });
          settingsStore.createIndex('lastSynced', 'lastSynced');

          // Sync queue store
          const syncQueueStore = db.createObjectStore('syncQueue', {
            keyPath: 'id'
          });
          syncQueueStore.createIndex('type', 'type');
          syncQueueStore.createIndex('timestamp', 'timestamp');
        }
      });

      console.log('Offline storage initialized');
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
    }
  }

  private setupOnlineOfflineHandlers() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    this.isOnline = navigator.onLine;
  }

  // Vocabulary methods
  async cacheVocabulary(words: VocabularyItem[]): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction('vocabulary', 'readwrite');
    const timestamp = Date.now();

    for (const word of words) {
      await tx.store.put({
        id: word.id,
        ko: word.ko,
        vi: word.en,
        level: 1,
        category: word.tags?.join(','),
        lastSynced: timestamp,
        isDeleted: false
      });
    }

    await tx.done;
    console.log(`Cached ${words.length} vocabulary words`);
  }

  async getCachedVocabulary(): Promise<VocabularyItem[]> {
    if (!this.db) return [];

    const words = await this.db.getAll('vocabulary');
    return words
      .filter(word => !word.isDeleted)
      .map(word => ({
        id: word.id,
        ko: word.ko,
        vi: word.en,
        tags: word.category ? word.category.split(',') : undefined
      }));
  }

  async addVocabularyOffline(word: VocabularyItem): Promise<void> {
    if (!this.db) return;

    const timestamp = Date.now();
    
    // Add to vocabulary store
    await this.db.put('vocabulary', {
      id: word.id,
      ko: word.ko,
      vi: word.en,
      level: 1,
      category: word.tags?.join(','),
      lastSynced: 0, // Not synced yet
      isDeleted: false
    });

    // Add to sync queue
    await this.addToSyncQueue('vocabulary', 'create', word);
  }

  // Progress methods
  async cacheProgress(progressData: any[]): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction('progress', 'readwrite');
    const timestamp = Date.now();

    for (const progress of progressData) {
      await tx.store.put({
        ...progress,
        lastSynced: timestamp
      });
    }

    await tx.done;
    console.log(`Cached ${progressData.length} progress records`);
  }

  async updateProgressOffline(wordId: string, progressData: any): Promise<void> {
    if (!this.db) return;

    const id = `progress_${wordId}`;
    
    await this.db.put('progress', {
      id,
      wordId,
      ...progressData,
      lastSynced: 0 // Not synced yet
    });

    // Add to sync queue
    await this.addToSyncQueue('progress', 'update', { id, wordId, ...progressData });
  }

  async getCachedProgress(): Promise<any[]> {
    if (!this.db) return [];
    return await this.db.getAll('progress');
  }

  // Game results methods
  async cacheGameResult(gameResult: any): Promise<void> {
    if (!this.db) return;

    const id = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.db.put('gameResults', {
      id,
      ...gameResult,
      timestamp: Date.now(),
      lastSynced: this.isOnline ? Date.now() : 0
    });

    // Add to sync queue if offline
    if (!this.isOnline) {
      await this.addToSyncQueue('gameResult', 'create', { id, ...gameResult });
    }
  }

  async getCachedGameResults(): Promise<any[]> {
    if (!this.db) return [];
    return await this.db.getAll('gameResults');
  }

  // Settings methods
  async cacheSetting(key: string, value: any): Promise<void> {
    if (!this.db) return;

    await this.db.put('settings', {
      key,
      value,
      lastSynced: this.isOnline ? Date.now() : 0
    });

    // Add to sync queue if offline
    if (!this.isOnline) {
      await this.addToSyncQueue('setting', 'update', { key, value });
    }
  }

  async getCachedSetting(key: string): Promise<any> {
    if (!this.db) return null;
    
    const setting = await this.db.get('settings', key);
    return setting?.value || null;
  }

  async getCachedSettings(): Promise<Record<string, any>> {
    if (!this.db) return {};
    
    const settings = await this.db.getAll('settings');
    const result: Record<string, any> = {};
    
    settings.forEach(setting => {
      result[setting.key] = setting.value;
    });
    
    return result;
  }

  // Sync queue methods
  private async addToSyncQueue(
    type: 'vocabulary' | 'progress' | 'gameResult' | 'setting',
    operation: 'create' | 'update' | 'delete',
    data: any
  ): Promise<void> {
    if (!this.db) return;

    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.db.put('syncQueue', {
      id,
      type,
      operation,
      data,
      timestamp: Date.now(),
      retryCount: 0
    });
  }

  async processSyncQueue(): Promise<void> {
    if (!this.db || !this.isOnline) return;

    const queueItems = await this.db.getAll('syncQueue');
    
    for (const item of queueItems) {
      try {
        await this.syncItem(item);
        
        // Remove from queue after successful sync
        await this.db.delete('syncQueue', item.id);
        
        // Update lastSynced timestamp in the respective store
        await this.updateLastSyncedTimestamp(item);
        
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
        
        // Increment retry count
        item.retryCount += 1;
        
        if (item.retryCount < 3) {
          await this.db.put('syncQueue', item);
        } else {
          // Remove after 3 failed attempts
          await this.db.delete('syncQueue', item.id);
          console.error(`Giving up on syncing item ${item.id} after 3 attempts`);
        }
      }
    }
  }

  private async syncItem(item: any): Promise<void> {
    // This would sync with a backend API if available
    // For now, just simulate the sync
    console.log(`Syncing ${item.type} ${item.operation}:`, item.data);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async updateLastSyncedTimestamp(item: any): Promise<void> {
    if (!this.db) return;
    
    const timestamp = Date.now();
    
    try {
      switch (item.type) {
        case 'vocabulary':
          const vocab = await this.db.get('vocabulary', item.data.id);
          if (vocab) {
            vocab.lastSynced = timestamp;
            await this.db.put('vocabulary', vocab);
          }
          break;
          
        case 'progress':
          const progress = await this.db.get('progress', item.data.id);
          if (progress) {
            progress.lastSynced = timestamp;
            await this.db.put('progress', progress);
          }
          break;
          
        case 'gameResult':
          const gameResult = await this.db.get('gameResults', item.data.id);
          if (gameResult) {
            gameResult.lastSynced = timestamp;
            await this.db.put('gameResults', gameResult);
          }
          break;
          
        case 'setting':
          const setting = await this.db.get('settings', item.data.key);
          if (setting) {
            setting.lastSynced = timestamp;
            await this.db.put('settings', setting);
          }
          break;
      }
    } catch (error) {
      console.error('Failed to update lastSynced timestamp:', error);
    }
  }

  // Utility methods
  async clearCache(): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction(['vocabulary', 'progress', 'gameResults', 'settings', 'syncQueue'], 'readwrite');
    
    await Promise.all([
      tx.objectStore('vocabulary').clear(),
      tx.objectStore('progress').clear(),
      tx.objectStore('gameResults').clear(),
      tx.objectStore('settings').clear(),
      tx.objectStore('syncQueue').clear()
    ]);

    await tx.done;
    console.log('Offline cache cleared');
  }

  async getCacheStats(): Promise<{
    vocabularyCount: number;
    progressCount: number;
    gameResultsCount: number;
    settingsCount: number;
    pendingSyncCount: number;
  }> {
    if (!this.db) {
      return {
        vocabularyCount: 0,
        progressCount: 0,
        gameResultsCount: 0,
        settingsCount: 0,
        pendingSyncCount: 0
      };
    }

    const [vocab, progress, gameResults, settings, syncQueue] = await Promise.all([
      this.db.count('vocabulary'),
      this.db.count('progress'),
      this.db.count('gameResults'),
      this.db.count('settings'),
      this.db.count('syncQueue')
    ]);

    return {
      vocabularyCount: vocab,
      progressCount: progress,
      gameResultsCount: gameResults,
      settingsCount: settings,
      pendingSyncCount: syncQueue
    };
  }

  get isOfflineMode(): boolean {
    return !this.isOnline;
  }
}

// Create singleton instance
export const offlineStorage = new OfflineStorageManager();
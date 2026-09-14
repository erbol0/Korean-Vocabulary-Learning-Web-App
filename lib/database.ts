'use client';

import Dexie, { type EntityTable } from 'dexie';
import { VocabularyItem, VocabProgress, GameResult, UserStats } from '../lib/types';

export interface VocabDB extends Dexie {
  vocabulary: EntityTable<VocabularyItem, 'id'>;
  progress: EntityTable<VocabProgress, 'vocabId'>;
  gameResults: EntityTable<GameResult, 'id'>;
  userStats: EntityTable<UserStats, 'id'>;
}

export const db = new Dexie('TopikVocabDB') as VocabDB;

db.version(1).stores({
  vocabulary: '&id, ko, vi, tags, addedAt',
  progress: '&vocabId, dueDate, easeFactor, intervalDays',
  gameResults: '++id, gameType, playedAt, score',
  userStats: '&id'
});

// Database operations
export class VocabDatabase {
  // Vocabulary operations
  static async addVocabulary(items: VocabularyItem[]): Promise<void> {
    await db.vocabulary.bulkAdd(items);
  }

  static async getVocabulary(): Promise<VocabularyItem[]> {
    return await db.vocabulary.toArray();
  }

  static async getVocabularyById(id: string): Promise<VocabularyItem | undefined> {
    return await db.vocabulary.get(id);
  }

  static async updateVocabulary(id: string, updates: Partial<VocabularyItem>): Promise<void> {
    await db.vocabulary.update(id, updates);
  }

  static async deleteVocabulary(id: string): Promise<void> {
    await db.vocabulary.delete(id);
  }

  static async searchVocabulary(query: string): Promise<VocabularyItem[]> {
    const lowerQuery = query.toLowerCase();
    return await db.vocabulary
      .filter(item => 
        item.ko.toLowerCase().includes(lowerQuery) || 
        item.vi.toLowerCase().includes(lowerQuery)
      )
      .toArray();
  }

  // Progress operations
  static async getProgress(vocabId: string): Promise<VocabProgress | undefined> {
    return await db.progress.get(vocabId);
  }

  static async updateProgress(progress: VocabProgress): Promise<void> {
    await db.progress.put(progress);
  }

  static async getDueVocabulary(): Promise<VocabProgress[]> {
    const now = Date.now();
    return await db.progress.where('dueDate').belowOrEqual(now).toArray();
  }

  static async getAllProgress(): Promise<VocabProgress[]> {
    return await db.progress.toArray();
  }

  // Game results operations
  static async addGameResult(result: GameResult): Promise<void> {
    await db.gameResults.add(result);
  }

  static async getGameResults(gameType?: string): Promise<GameResult[]> {
    if (gameType) {
      return await db.gameResults.where('gameType').equals(gameType).toArray();
    }
    return await db.gameResults.toArray();
  }

  static async getRecentGameResults(limit: number = 10): Promise<GameResult[]> {
    return await db.gameResults
      .orderBy('playedAt')
      .reverse()
      .limit(limit)
      .toArray();
  }

  // User stats operations
  static async getUserStats(): Promise<UserStats> {
    const stats = await db.userStats.get('main');
    if (!stats) {
      const defaultStats: UserStats = {
        totalWordsLearned: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastStudyDate: 0,
        totalGamesPlayed: 0,
        averageAccuracy: 0,
        totalTimeSpent: 0,
        level: 1,
        xp: 0
      };
      await db.userStats.put({ ...defaultStats, id: 'main' });
      return defaultStats;
    }
    return stats;
  }

  static async updateUserStats(updates: Partial<UserStats>): Promise<void> {
    await db.userStats.update('main', updates);
  }

  // Export/Import operations
  static async exportData(): Promise<{
    vocabulary: VocabularyItem[];
    progress: VocabProgress[];
    gameResults: GameResult[];
    userStats: UserStats;
  }> {
    const [vocabulary, progress, gameResults, userStats] = await Promise.all([
      db.vocabulary.toArray(),
      db.progress.toArray(),
      db.gameResults.toArray(),
      this.getUserStats()
    ]);

    return {
      vocabulary,
      progress,
      gameResults,
      userStats
    };
  }

  static async importData(data: {
    vocabulary?: VocabularyItem[];
    progress?: VocabProgress[];
    gameResults?: GameResult[];
    userStats?: UserStats;
  }): Promise<void> {
    await db.transaction('rw', db.vocabulary, db.progress, db.gameResults, db.userStats, async () => {
      if (data.vocabulary) {
        await db.vocabulary.clear();
        await db.vocabulary.bulkAdd(data.vocabulary);
      }
      if (data.progress) {
        await db.progress.clear();
        await db.progress.bulkAdd(data.progress);
      }
      if (data.gameResults) {
        await db.gameResults.clear();
        await db.gameResults.bulkAdd(data.gameResults);
      }
      if (data.userStats) {
        await db.userStats.put({ ...data.userStats, id: 'main' });
      }
    });
  }

  static async clearAllData(): Promise<void> {
    await db.transaction('rw', db.vocabulary, db.progress, db.gameResults, db.userStats, async () => {
      await db.vocabulary.clear();
      await db.progress.clear();
      await db.gameResults.clear();
      await db.userStats.clear();
    });
  }
}
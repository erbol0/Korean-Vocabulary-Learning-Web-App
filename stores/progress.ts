'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VocabProgress, GameResult, UserStats } from '../lib/types';
import { VocabDatabase } from '../lib/database';
import { createInitialProgress, calculateNextReview, AnswerQuality } from '../utils/spaced-repetition';

interface ProgressStore {
  progress: Map<string, VocabProgress>;
  gameResults: GameResult[];
  userStats: UserStats;
  isLoading: boolean;

  // Actions
  loadProgress: () => Promise<void>;
  updateVocabProgress: (vocabId: string, quality: AnswerQuality) => Promise<void>;
  addGameResult: (result: GameResult) => Promise<void>;
  updateStats: (updates: Partial<UserStats>) => Promise<void>;
  
  // Getters
  getDueVocabulary: () => string[];
  getProgressForVocab: (vocabId: string) => VocabProgress | null;
  getTodayStats: () => { studied: number; correct: number; total: number };
  getStreak: () => number;
  getLevel: () => number;
  getXP: () => number;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      progress: new Map(),
      gameResults: [],
      userStats: {
        totalWordsLearned: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastStudyDate: 0,
        totalGamesPlayed: 0,
        averageAccuracy: 0,
        totalTimeSpent: 0,
        level: 1,
        xp: 0
      },
      isLoading: false,

      loadProgress: async () => {
        set({ isLoading: true });
        try {
          const [progressData, gameResults, userStats] = await Promise.all([
            VocabDatabase.getAllProgress(),
            VocabDatabase.getGameResults(),
            VocabDatabase.getUserStats()
          ]);

          const progressMap = new Map();
          progressData.forEach(p => progressMap.set(p.vocabId, p));

          set({
            progress: progressMap,
            gameResults,
            userStats,
            isLoading: false
          });
        } catch (error) {
          console.error('Failed to load progress:', error);
          set({ isLoading: false });
        }
      },

      updateVocabProgress: async (vocabId: string, quality: AnswerQuality) => {
        try {
          const { progress } = get();
          let currentProgress = progress.get(vocabId);
          
          if (!currentProgress) {
            currentProgress = createInitialProgress(vocabId);
          }

          const updatedProgress = calculateNextReview(currentProgress, quality);
          await VocabDatabase.updateProgress(updatedProgress);

          const newProgressMap = new Map(progress);
          newProgressMap.set(vocabId, updatedProgress);
          set({ progress: newProgressMap });

          // Update user stats
          const { userStats } = get();
          const today = new Date().toDateString();
          const lastStudyDay = new Date(userStats.lastStudyDate).toDateString();
          
          let newStreak = userStats.currentStreak;
          if (lastStudyDay !== today) {
            // New day - check if streak continues
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastStudyDay === yesterday.toDateString()) {
              newStreak += 1;
            } else {
              newStreak = 1; // Reset streak
            }
          }

          const updatedStats: Partial<UserStats> = {
            lastStudyDate: Date.now(),
            currentStreak: newStreak,
            bestStreak: Math.max(userStats.bestStreak, newStreak),
            totalWordsLearned: quality >= AnswerQuality.GOOD ? 
              userStats.totalWordsLearned + 1 : userStats.totalWordsLearned,
            xp: userStats.xp + (quality >= AnswerQuality.GOOD ? 10 : 5)
          };

          // Calculate level from XP
          updatedStats.level = Math.floor(updatedStats.xp! / 100) + 1;

          await get().updateStats(updatedStats);
        } catch (error) {
          console.error('Failed to update vocab progress:', error);
        }
      },

      addGameResult: async (result: GameResult) => {
        try {
          await VocabDatabase.addGameResult(result);
          const { gameResults, userStats } = get();
          
          set({ gameResults: [...gameResults, result] });

          // Update user stats
          const updatedStats: Partial<UserStats> = {
            totalGamesPlayed: userStats.totalGamesPlayed + 1,
            totalTimeSpent: userStats.totalTimeSpent + result.timeSpent,
            xp: userStats.xp + result.score
          };

          // Recalculate average accuracy
          const allResults = [...gameResults, result];
          const totalQuestions = allResults.reduce((sum, r) => sum + r.totalQuestions, 0);
          const totalCorrect = allResults.reduce((sum, r) => sum + r.correctAnswers, 0);
          updatedStats.averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
          updatedStats.level = Math.floor(updatedStats.xp! / 100) + 1;

          await get().updateStats(updatedStats);
        } catch (error) {
          console.error('Failed to add game result:', error);
        }
      },

      updateStats: async (updates: Partial<UserStats>) => {
        try {
          await VocabDatabase.updateUserStats(updates);
          const { userStats } = get();
          set({ userStats: { ...userStats, ...updates } });
        } catch (error) {
          console.error('Failed to update user stats:', error);
        }
      },

      getDueVocabulary: () => {
        const { progress } = get();
        const now = Date.now();
        const dueVocab: string[] = [];

        progress.forEach((vocabProgress, vocabId) => {
          if (vocabProgress.dueDate <= now) {
            dueVocab.push(vocabId);
          }
        });

        return dueVocab;
      },

      getProgressForVocab: (vocabId: string) => {
        const { progress } = get();
        return progress.get(vocabId) || null;
      },

      getTodayStats: () => {
        const { gameResults } = get();
        const today = new Date().toDateString();
        
        const todayResults = gameResults.filter(result =>
          new Date(result.playedAt).toDateString() === today
        );

        const studied = todayResults.length;
        const correct = todayResults.reduce((sum, r) => sum + r.correctAnswers, 0);
        const total = todayResults.reduce((sum, r) => sum + r.totalQuestions, 0);

        return { studied, correct, total };
      },

      getStreak: () => {
        return get().userStats.currentStreak;
      },

      getLevel: () => {
        return get().userStats.level;
      },

      getXP: () => {
        return get().userStats.xp;
      }
    }),
    {
      name: 'progress-storage',
      partialize: (state) => ({
        userStats: state.userStats
      })
    }
  )
);
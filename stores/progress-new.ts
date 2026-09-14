'use client';

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultSrs, reviewSrs, isDue, type SrsGrade, type SrsState } from "@/lib/srs";

export type WordProgress = {
  srs: SrsState;
  correct: number;
  wrong: number;
  lastSeen?: number;
  firstSeen?: number;
};

export type DailyStat = { 
  date: string; 
  correct: number; 
  wrong: number; 
  xp: number; 
  studyTime: number; // minutes
  wordsStudied: number;
};

export type GameResult = {
  gameType: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  timestamp: number;
};

type ProgressState = {
  // User stats
  xp: number;
  level: number;
  streak: number;
  totalWordsStudied: number;
  totalStudyTime: number; // minutes
  lastActiveDate?: string;
  
  // Daily tracking
  daily: Record<string, DailyStat>;
  
  // Word progress
  words: Record<string, WordProgress>;
  
  // Game results
  gameResults: GameResult[];
  
  // Actions
  ensureWord: (id: string) => void;
  markResult: (id: string, grade: SrsGrade, wasCorrect: boolean, studyTime?: number) => void;
  addGameResult: (result: Omit<GameResult, 'timestamp'>) => void;
  getDueWords: (wordIds: string[]) => string[];
  getWordProgress: (id: string) => WordProgress | null;
  getTodayStats: () => DailyStat;
  getWeeklyStats: () => DailyStat[];
  resetProgress: () => void;
};

function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function calcLevel(xp: number) {
  // Level progression: 1->2 (100xp), 2->3 (300xp), 3->4 (600xp), etc.
  return Math.max(1, Math.floor(Math.sqrt(xp / 50)) + 1);
}

export const useProgressStoreNew = create<ProgressState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streak: 0,
      totalWordsStudied: 0,
      totalStudyTime: 0,
      daily: {},
      words: {},
      gameResults: [],

      ensureWord: (id) =>
        set((st) => {
          if (st.words[id]) return st;
          return {
            ...st,
            words: {
              ...st.words,
              [id]: { 
                srs: defaultSrs(), 
                correct: 0, 
                wrong: 0, 
                firstSeen: Date.now()
              },
            },
          };
        }),

      markResult: (id, grade, wasCorrect, studyTime = 1) =>
        set((st) => {
          const now = Date.now();
          const today = todayKey();
          const prevDay = st.lastActiveDate;

          // Calculate streak
          let streak = st.streak;
          if (!prevDay) {
            streak = 1;
          } else if (prevDay !== today) {
            const prev = new Date(prevDay);
            const cur = new Date(today);
            const diffDays = Math.round((cur.getTime() - prev.getTime()) / (24 * 3600 * 1000));
            streak = diffDays === 1 ? streak + 1 : 1;
          }

          // Get or create word progress
          const wp = st.words[id] ?? { 
            srs: defaultSrs(now), 
            correct: 0, 
            wrong: 0, 
            firstSeen: now
          };
          
          const updatedSrs = reviewSrs(wp.srs, grade, now);

          // Calculate XP gain based on grade and difficulty
          const baseXp = wasCorrect ? 10 : 3;
          const gradeBonus = grade * 5;
          const difficultyBonus = wp.wrong > wp.correct ? 5 : 0;
          const gainedXp = baseXp + gradeBonus + difficultyBonus;
          
          const xp = st.xp + gainedXp;
          const level = calcLevel(xp);
          
          // Update daily stats
          const daily = { ...st.daily };
          daily[today] = daily[today] ?? { 
            date: today, 
            correct: 0, 
            wrong: 0, 
            xp: 0, 
            studyTime: 0, 
            wordsStudied: 0 
          };
          
          const isNewWordToday = !wp.lastSeen || 
            todayKey(new Date(wp.lastSeen)) !== today;
          
          daily[today] = {
            ...daily[today],
            correct: daily[today].correct + (wasCorrect ? 1 : 0),
            wrong: daily[today].wrong + (wasCorrect ? 0 : 1),
            xp: daily[today].xp + gainedXp,
            studyTime: daily[today].studyTime + studyTime,
            wordsStudied: daily[today].wordsStudied + (isNewWordToday ? 1 : 0),
          };

          return {
            ...st,
            xp,
            level,
            streak,
            totalStudyTime: st.totalStudyTime + studyTime,
            totalWordsStudied: st.totalWordsStudied + (isNewWordToday ? 1 : 0),
            lastActiveDate: today,
            daily,
            words: {
              ...st.words,
              [id]: {
                ...wp,
                srs: updatedSrs,
                correct: wp.correct + (wasCorrect ? 1 : 0),
                wrong: wp.wrong + (wasCorrect ? 0 : 1),
                lastSeen: now,
              },
            },
          };
        }),

      addGameResult: (result) =>
        set((st) => ({
          ...st,
          gameResults: [...st.gameResults, { ...result, timestamp: Date.now() }],
        })),

      getDueWords: (wordIds) => {
        const st = get();
        const now = Date.now();
        return wordIds.filter(id => {
          const progress = st.words[id];
          if (!progress) return true; // New words are due
          return isDue(progress.srs, now);
        });
      },

      getWordProgress: (id) => {
        const st = get();
        return st.words[id] || null;
      },

      getTodayStats: () => {
        const st = get();
        const today = todayKey();
        return st.daily[today] || { 
          date: today, 
          correct: 0, 
          wrong: 0, 
          xp: 0, 
          studyTime: 0, 
          wordsStudied: 0 
        };
      },

      getWeeklyStats: () => {
        const st = get();
        const stats: DailyStat[] = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateKey = todayKey(date);
          
          stats.push(st.daily[dateKey] || { 
            date: dateKey, 
            correct: 0, 
            wrong: 0, 
            xp: 0, 
            studyTime: 0, 
            wordsStudied: 0 
          });
        }
        
        return stats;
      },

      resetProgress: () =>
        set({
          xp: 0,
          level: 1,
          streak: 0,
          totalWordsStudied: 0,
          totalStudyTime: 0,
          lastActiveDate: undefined,
          daily: {},
          words: {},
          gameResults: [],
        }),
    }),
    { name: "topik1-progress-v2" }
  )
);
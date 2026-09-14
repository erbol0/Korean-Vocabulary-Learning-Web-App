// Vocabulary item interface
export interface VocabularyItem {
  id: string;
  stt?: number;
  ko: string; // Korean word
  vi: string; // english meaning
  tags?: string[];
  addedAt?: number;
}

// Progress tracking interfaces
export interface VocabProgress {
  vocabId: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  dueDate: number;
  correctAnswers: number;
  wrongAnswers: number;
  lastStudied?: number;
}

// Game result interface
export interface GameResult {
  id?: number;
  gameType: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  playedAt: number;
}

// User statistics
export interface UserStats {
  id?: string;
  totalWordsLearned: number;
  currentStreak: number;
  bestStreak: number;
  lastStudyDate: number;
  totalGamesPlayed: number;
  averageAccuracy: number;
  totalTimeSpent: number;
  level: number;
  xp: number;
}

// Game difficulty levels
export type GameDifficulty = 'easy' | 'medium' | 'hard';

// Learning session types
export type SessionType = 'flashcards' | 'quiz' | 'listening' | 'typing' | 'matching' | 'speed';

// Theme configuration
export interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
}

// Audio settings
export interface AudioSettings {
  enabled: boolean;
  voice?: string;
  rate: number;
  pitch: number;
  autoplay: boolean;
}
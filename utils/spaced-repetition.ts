import { VocabProgress } from '../lib/types';

/**
 * Spaced Repetition Algorithm based on SM-2
 * This algorithm schedules reviews based on how well the user remembers each word
 */

export enum AnswerQuality {
  FORGOT = 0,      // Complete blackout
  HARD = 1,        // Incorrect response, but correct one remembered
  GOOD = 2,        // Correct response with hesitation  
  EASY = 3,        // Perfect response
}

export function calculateNextReview(
  progress: VocabProgress,
  quality: AnswerQuality
): VocabProgress {
  let { easeFactor, intervalDays, repetitions } = progress;

  // Update ease factor based on quality
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  if (quality < AnswerQuality.GOOD) {
    // Reset if answer was poor
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
  }

  // Calculate next due date
  const dueDate = Date.now() + (intervalDays * 24 * 60 * 60 * 1000);

  // Update statistics
  const updatedProgress: VocabProgress = {
    ...progress,
    easeFactor,
    intervalDays,
    repetitions,
    dueDate,
    lastStudied: Date.now(),
    correctAnswers: quality >= AnswerQuality.GOOD ? 
      progress.correctAnswers + 1 : progress.correctAnswers,
    wrongAnswers: quality < AnswerQuality.GOOD ? 
      progress.wrongAnswers + 1 : progress.wrongAnswers,
  };

  return updatedProgress;
}

export function createInitialProgress(vocabId: string): VocabProgress {
  return {
    vocabId,
    easeFactor: 2.5,
    intervalDays: 1,
    repetitions: 0,
    dueDate: Date.now(), // Due immediately for new words
    correctAnswers: 0,
    wrongAnswers: 0,
  };
}

export function getDifficultyLevel(progress: VocabProgress): 'new' | 'learning' | 'review' | 'mature' {
  if (progress.repetitions === 0) return 'new';
  if (progress.repetitions < 3) return 'learning';
  if (progress.intervalDays < 21) return 'review';
  return 'mature';
}

export function getSuccessRate(progress: VocabProgress): number {
  const total = progress.correctAnswers + progress.wrongAnswers;
  if (total === 0) return 0;
  return (progress.correctAnswers / total) * 100;
}

export function isDue(progress: VocabProgress): boolean {
  return progress.dueDate <= Date.now();
}

export function getDaysUntilDue(progress: VocabProgress): number {
  const msUntilDue = progress.dueDate - Date.now();
  return Math.ceil(msUntilDue / (24 * 60 * 60 * 1000));
}

export function getRetentionRate(progressList: VocabProgress[]): number {
  const studiedWords = progressList.filter(p => p.repetitions > 0);
  if (studiedWords.length === 0) return 0;
  
  const avgSuccessRate = studiedWords.reduce((sum, p) => sum + getSuccessRate(p), 0) / studiedWords.length;
  return avgSuccessRate;
}
export type SrsGrade = 0 | 1 | 2 | 3;

export type SrsState = {
  easeFactor: number;     // EF
  intervalDays: number;   // I
  repetitions: number;    // n
  dueDate: number;        // ms timestamp
};

const DAY = 24 * 60 * 60 * 1000;

export function defaultSrs(now = Date.now()): SrsState {
  return { easeFactor: 2.5, intervalDays: 0, repetitions: 0, dueDate: now };
}

export function reviewSrs(prev: SrsState, grade: SrsGrade, now = Date.now()): SrsState {
  // map grade 0..3 -> quality 0..5 (SM-2)
  const q = grade === 3 ? 5 : grade === 2 ? 4 : grade === 1 ? 2 : 0;

  let ef = prev.easeFactor;
  let reps = prev.repetitions;
  let interval = prev.intervalDays;

  if (q < 3) {
    reps = 0;
    interval = 1;
  } else {
    reps = reps + 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * ef);
  }

  // EF update
  ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ef < 1.3) ef = 1.3;

  const dueDate = now + interval * DAY;
  return { easeFactor: ef, repetitions: reps, intervalDays: interval, dueDate };
}

export function isDue(s: SrsState, now = Date.now()) {
  return s.dueDate <= now;
}

export function getDueItems<T extends { id: string }>(
  items: T[], 
  progressMap: Record<string, { srs: SrsState }>,
  now = Date.now()
): T[] {
  return items.filter(item => {
    const progress = progressMap[item.id];
    if (!progress) return true; // New items are due
    return isDue(progress.srs, now);
  });
}

export function getNextReviewTime(srs: SrsState): string {
  const now = Date.now();
  if (isDue(srs, now)) return 'Due now';
  
  const diff = srs.dueDate - now;
  const days = Math.floor(diff / DAY);
  const hours = Math.floor((diff % DAY) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}
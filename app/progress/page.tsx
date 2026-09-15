'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useProgressStoreNew } from '@/stores/progress-new';
import { useVocabularyStore } from '@/stores/vocabulary';
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Calendar,
  Award,
  Flame
} from 'lucide-react';

export default function ProgressPage() {
  const { 
    xp, 
    level, 
    streak, 
    totalWordsStudied, 
    totalStudyTime, 
    getTodayStats, 
    getWeeklyStats,
    gameResults,
    words
  } = useProgressStoreNew();
  
  const { vocabulary, loadVocabulary } = useVocabularyStore();
  
  const todayStats = getTodayStats();
  const weeklyStats = getWeeklyStats();

  useEffect(() => {
    loadVocabulary();
  }, [loadVocabulary]);

  // Calculate next level progress
  const currentLevelXp = Math.pow(level - 1, 2) * 50;
  const nextLevelXp = Math.pow(level, 2) * 50;
  const levelProgress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

  // Calculate accuracy
  const totalAnswers = Object.values(words).reduce((sum, word) => sum + word.correct + word.wrong, 0);
  const totalCorrect = Object.values(words).reduce((sum, word) => sum + word.correct, 0);
  const accuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

  // Get most difficult words
  const difficultWords = Object.entries(words)
    .map(([id, progress]) => ({ 
      id, 
      ...progress, 
      errorRate: progress.wrong / (progress.correct + progress.wrong) 
    }))
    .filter(word => word.correct + word.wrong >= 3)
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          📊 Learning Progress
        </h1>
        <p className="text-muted-foreground">
          Track your Korean vocabulary learning journey
        </p>
      </div>

      {/* Level & XP */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">Level {level}</div>
                <div className="text-sm text-muted-foreground">{xp} XP total</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{Math.round(levelProgress)}%</div>
              <div className="text-sm text-muted-foreground">to Level {level + 1}</div>
            </div>
          </div>
          
          <Progress value={levelProgress} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{xp - currentLevelXp} XP</span>
            <span>{nextLevelXp - xp} XP to go</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Flame className="h-8 w-8 mx-auto text-orange-500 mb-2" />
            <div className="text-3xl font-bold text-orange-500">{streak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <div className="text-3xl font-bold text-green-500">{totalWordsStudied}</div>
            <div className="text-sm text-muted-foreground">Words Learned</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <div className="text-3xl font-bold text-blue-500">{totalStudyTime}m</div>
            <div className="text-sm text-muted-foreground">Study Time</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <div className="text-3xl font-bold text-purple-500">{accuracy}%</div>
            <div className="text-sm text-muted-foreground">Accuracy Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{todayStats.correct}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{todayStats.wrong}</div>
              <div className="text-sm text-muted-foreground">Wrong</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{todayStats.xp}</div>
              <div className="text-sm text-muted-foreground">XP Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{todayStats.studyTime}m</div>
              <div className="text-sm text-muted-foreground">Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{todayStats.wordsStudied}</div>
              <div className="text-sm text-muted-foreground">New Words</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyStats.map((stat) => {
              const date = new Date(stat.date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const maxXp = Math.max(...weeklyStats.map(s => s.xp)) || 1;
              const percentage = (stat.xp / maxXp) * 100;

              return (
                <div key={stat.date} className="flex items-center gap-4">
                  <div className="w-12 text-sm text-muted-foreground">
                    {dayName}
                  </div>
                  <div className="flex-1">
                    <Progress value={percentage} className="h-2" />
                  </div>
                  <div className="w-16 text-sm text-right">
                    <span className="font-medium">{stat.xp}</span>
                    <span className="text-muted-foreground"> XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Difficult Words */}
      {difficultWords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Words to Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {difficultWords.map((word) => {
                const vocabItem = vocabulary.find(v => v.id === word.id);
                if (!vocabItem) return null;

                return (
                  <div key={word.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-semibold">{vocabItem.ko}</div>
                      <div className="text-sm text-muted-foreground">{vocabItem.en || vocabItem.en}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        <span className="text-red-600">{word.wrong}</span>
                        <span className="text-muted-foreground"> wrong / </span>
                        <span className="text-green-600">{word.correct}</span>
                        <span className="text-muted-foreground"> correct</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(word.errorRate * 100)}% wrong
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Results */}
      {gameResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Game History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gameResults.slice(-5).reverse().map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-semibold capitalize">{result.gameType}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(result.timestamp).toLocaleDateString('en-US')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{result.score} pts</div>
                    <div className="text-sm text-muted-foreground">
                      {result.correctAnswers}/{result.totalQuestions} correct
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
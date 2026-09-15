/* eslint-disable react-hooks/purity */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useVocabularyStore } from '@/stores/vocabulary';
import { useProgressStoreNew } from '@/stores/progress-new';
import { Volume2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { SpeechService } from '@/utils/speech';
import { getNextReviewTime } from '@/lib/srs';
import Link from 'next/link';

export default function FlashcardsPage() {
  const { vocabulary, loadVocabulary } = useVocabularyStore();
  const { 
    ensureWord, 
    markResult, 
    getDueWords, 
    getWordProgress, 
    getTodayStats 
  } = useProgressStoreNew();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionWords, setSessionWords] = useState<string[]>([]);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });
  const [sessionStartTime] = useState(Date.now());
  const [speechService, setSpeechService] = useState<SpeechService | null>(null);

  const todayStats = getTodayStats();

  useEffect(() => {
    // Initialize speech service only on client side
    setSpeechService(new SpeechService());
    loadVocabulary();
  }, [loadVocabulary]);

  useEffect(() => {
    if (vocabulary.length > 0) {
      const vocabIds = vocabulary.map(v => v.id);
      const dueWords = getDueWords(vocabIds);
      
      // Limit to 20 words per session for focused learning
      let sessionWords = dueWords.slice(0, 20);
      
      // If no due words, take some random words
      if (sessionWords.length === 0) {
        const randomWords = vocabulary
          .sort(() => Math.random() - 0.5)
          .slice(0, 10)
          .map(v => v.id);
        sessionWords = randomWords;
      }
      
      setSessionWords(sessionWords);
      
      // Ensure word progress exists for all session words
      sessionWords.forEach(id => ensureWord(id));
    }
  }, [vocabulary, getDueWords, ensureWord]);

  const currentWord = sessionWords.length > 0 
    ? vocabulary.find(v => v.id === sessionWords[currentIndex])
    : null;

  const currentProgress = currentWord ? getWordProgress(currentWord.id) : null;

  const handleGrade = (grade: 0 | 1 | 2 | 3) => {
    if (!currentWord) return;
    
    const wasCorrect = grade >= 2;
    const studyTime = Math.floor((Date.now() - sessionStartTime) / (60 * 1000)) || 1;
    
    markResult(currentWord.id, grade, wasCorrect, studyTime);
    
    setSessionStats(prev => ({
      correct: prev.correct + (wasCorrect ? 1 : 0),
      wrong: prev.wrong + (wasCorrect ? 0 : 1),
    }));
    
    // Move to next card
    if (currentIndex < sessionWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // Session complete - restart
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  };

  const handlePlayAudio = () => {
    if (currentWord && speechService) {
      speechService.speak(currentWord.ko);
    }
  };

  const progressPercentage = sessionWords.length > 0 
    ? ((currentIndex + 1) / sessionWords.length) * 100 
    : 0;

  if (sessionWords.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <CardTitle>🎉 All Done!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You&apos;ve completed all required vocabulary reviews for today. Great job!
            </p>
            <div className="bg-muted rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">{todayStats.correct}</div>
              <div className="text-sm text-muted-foreground">Words reviewed today</div>
            </div>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentWord) return null;

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            Card {currentIndex + 1} / {sessionWords.length}
          </div>
          <Progress value={progressPercentage} className="w-32 mt-1" />
        </div>
        
        <div className="flex gap-2 text-sm">
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            {sessionStats.correct}
          </span>
          <span className="flex items-center gap-1 text-red-600">
            <XCircle className="h-4 w-4" />
            {sessionStats.wrong}
          </span>
        </div>
      </div>

      {/* Flashcard */}
      <div className="max-w-2xl mx-auto">
        <Card 
          className={`min-h-[400px] cursor-pointer transition-all duration-300 hover:shadow-lg card-flip ${
            isFlipped
              ? 'bg-gradient-to-br from-[#091a45] via-[#1b1147] to-[#3d1a63] text-white shadow-[0_24px_60px_rgba(69,33,115,0.28)]'
              : 'bg-white text-slate-900'
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <CardContent className="flex min-h-[400px] items-center justify-center p-8 text-center">
            {!isFlipped ? (
              // Front of card - Korean word
              <div className="space-y-6 text-slate-900">
                <div className="mb-6 text-6xl font-bold text-primary animate-floaty">
                  {currentWord.ko}
                </div>
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayAudio();
                  }}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Volume2 className="h-5 w-5" />
                  Listen to Pronunciation
                </Button>
                
                <p className="mt-8 text-sm text-muted-foreground">
                  Click to reveal meaning
                </p>
              </div>
            ) : (
              // Back of card - English meaning
              <div className="space-y-6 text-white slide-up">
                <div className="mb-2 text-3xl text-white/80">
                  {currentWord.ko}
                </div>
                
                <div className="mb-6 text-5xl font-bold text-white">
                  {currentWord.en}
                </div>
                
                {currentWord.tags && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {currentWord.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/90 ring-1 ring-white/15"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {currentProgress && (
                  <div className="rounded-lg border border-white/15 bg-white/8 p-3 text-sm text-white/90">
                    <div>Studied: {currentProgress.correct + currentProgress.wrong} times</div>
                    <div>Correct: {currentProgress.correct} | Incorrect: {currentProgress.wrong}</div>
                    <div>Next Review: {getNextReviewTime(currentProgress.srs)}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grade Buttons */}
        {isFlipped && (
          <div className="mt-6 space-y-4 bounce-in">
            <p className="text-center text-sm text-muted-foreground">
              Rate your recall of this word:
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={() => handleGrade(0)}
                variant="destructive"
                className="h-16 flex flex-col gap-1"
              >
                <div className="font-bold">0</div>
                <div className="text-xs">Completely Forgot</div>
              </Button>
              
              <Button
                onClick={() => handleGrade(1)}
                variant="outline"
                className="h-16 flex flex-col gap-1 text-orange-600 border-orange-600"
              >
                <div className="font-bold">1</div>
                <div className="text-xs">Hard</div>
              </Button>
              
              <Button
                onClick={() => handleGrade(2)}
                variant="outline"
                className="h-16 flex flex-col gap-1 text-blue-600 border-blue-600"
              >
                <div className="font-bold">2</div>
                <div className="text-xs">Good</div>
              </Button>
              
              <Button
                onClick={() => handleGrade(3)}
                className="h-16 flex flex-col gap-1 bg-green-600 hover:bg-green-700"
              >
                <div className="font-bold">3</div>
                <div className="text-xs">Easy</div>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useVocabularyStore } from '@/stores/vocabulary';
import { useProgressStoreNew } from '@/stores/progress-new';
import { Volume2, ArrowLeft, CheckCircle, XCircle, Trophy, Zap, Clock } from 'lucide-react';
import { SpeechService } from '@/utils/speech';
import { shuffleArray } from '@/lib/utils';
import Link from 'next/link';

type Question = {
  word: { ko: string; en?: string; vi?: string; id: string };
  options: string[];
  correctIndex: number;
};

export default function SpeedGamePage() {
  const { vocabulary, loadVocabulary } = useVocabularyStore();
  const { ensureWord, markResult, addGameResult } = useProgressStoreNew();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameStartTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds game
  const [isGameActive, setIsGameActive] = useState(false);
  const [speechService, setSpeechService] = useState<SpeechService | null>(null);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  useEffect(() => {
    setSpeechService(new SpeechService());
    loadVocabulary();
  }, [loadVocabulary]);

  useEffect(() => {
    if (vocabulary.length >= 4) {
      generateQuestions();
    }
  }, [vocabulary]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isGameActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isGameActive) {
      finishGame();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft, isGameActive]);

  const generateQuestions = useCallback(() => {
    if (vocabulary.length < 4) return;

    const gameQuestions: Question[] = [];
    const shuffledVocab = shuffleArray([...vocabulary]);
    const numQuestions = Math.min(50, shuffledVocab.length * 2); // More questions for speed game

    for (let i = 0; i < numQuestions; i++) {
      const correctWord = shuffledVocab[i % shuffledVocab.length];
      const correctTranslation = correctWord.en || correctWord.en || '';
      
      const otherWords = shuffledVocab
        .filter(word => word.id !== correctWord.id)
        .slice(0, 3);

      const options = shuffleArray([
        correctTranslation,
        ...otherWords.map(w => w.en || w.en || '')
      ]);
      const correctIndex = options.indexOf(correctTranslation);

      gameQuestions.push({
        word: correctWord,
        options,
        correctIndex
      });

      ensureWord(correctWord.id);
    }

    setQuestions(gameQuestions);
  }, [vocabulary, ensureWord]);

  const startGame = () => {
    setIsGameActive(true);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(60);
    setIsAnswered(false);
    setShowResult(false);
  };

  const handleAnswerSelect = (selectedIndex: number) => {
    if (isAnswered || !isGameActive) return;

    setSelectedAnswer(selectedIndex);
    setIsAnswered(true);

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedIndex === currentQuestion.correctIndex;

    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      setMaxStreak(Math.max(maxStreak, streak + 1));
      markResult(currentQuestion.word.id, 3, true);
    } else {
      setStreak(0);
      markResult(currentQuestion.word.id, 0, false);
    }

    // Quick transition for speed game
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        // Generate more questions if needed
        if (timeLeft > 0) {
          generateQuestions();
          setCurrentIndex(0);
          setSelectedAnswer(null);
          setIsAnswered(false);
        }
      }
    }, 500);
  };

  const finishGame = () => {
    setIsGameActive(false);
    const timeSpent = 60 - timeLeft;
    const questionsAnswered = score + (currentIndex + 1 - score);
    
    addGameResult({
      gameType: 'speed',
      score: score * 10 + maxStreak * 5, // Bonus for streaks
      correctAnswers: score,
      totalQuestions: questionsAnswered,
      timeSpent,
    });

    setShowResult(true);
  };

  const handlePlayAudio = () => {
    if (questions[currentIndex] && speechService && isGameActive) {
      speechService.speak(questions[currentIndex].word.ko);
    }
  };

  if (vocabulary.length < 4) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Zap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-4">More Vocabulary Needed</h2>
            <p className="text-muted-foreground mb-6">
              You need at least 4 vocabulary words to play the speed game.
            </p>
            <Link href="/import">
              <Button>Add Vocabulary</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResult) {
    const questionsAnswered = score + (currentIndex + 1 - score);
    const accuracy = questionsAnswered > 0 ? Math.round((score / questionsAnswered) * 100) : 0;
    const finalScore = score * 10 + maxStreak * 5;

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-4">Game Complete!</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Correct Answers:</span>
                <span className="font-bold">{score}</span>
              </div>
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span className="font-bold">{accuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span>Best Streak:</span>
                <span className="font-bold">{maxStreak}</span>
              </div>
              <div className="flex justify-between">
                <span>Score:</span>
                <span className="font-bold">{finalScore}</span>
              </div>
              <div className="flex justify-between">
                <span>XP Earned:</span>
                <span className="font-bold text-green-600">+{finalScore}</span>
              </div>
            </div>
            <div className="space-y-3">
              <Button onClick={startGame} className="w-full">
                Play Again
              </Button>
              <Link href="/games">
                <Button variant="outline" className="w-full">
                  Back to Games
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isGameActive) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-3">
              <Zap className="h-8 w-8 text-orange-500" />
              Speed Game
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-2">Rules:</h3>
              <ul className="text-sm text-orange-700 space-y-1 text-left">
                <li>• Answer as many questions as you can in 60 seconds</li>
                <li>• Each correct answer = 10 points</li>
                <li>• Consecutive correct answers = bonus points</li>
                <li>• Speed and accuracy are key!</li>
              </ul>
            </div>
            
            <Button 
              onClick={startGame} 
              size="lg" 
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Zap className="h-5 w-5 mr-2" />
              Start 60-Second Game!
            </Button>
            
            <Link href="/games">
              <Button variant="outline" className="w-full">
                Back
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading questions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with Timer */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/games">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit
            </Button>
          </Link>
          
          <div className="text-center">
            <div className={`flex items-center justify-center gap-2 mb-1 ${
              timeLeft <= 10 ? 'text-red-600' : 'text-orange-600'
            }`}>
              <Clock className="h-5 w-5" />
              <span className="text-2xl font-bold">{timeLeft}s</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Score: {score} | Streak: {streak}
            </p>
          </div>
          
          <div className="w-20"></div>
        </div>

        {/* Timer Progress */}
        <div className="mb-6">
          <Progress value={(timeLeft / 60) * 100} className="h-3" />
        </div>

        {/* Question Card */}
        <Card className="mb-6 animate-bounce-in">
          <CardContent className="p-6 text-center space-y-6">
            {/* Korean word with audio */}
            <div className="flex items-center justify-center gap-4">
              <div className="bg-orange-50 rounded-lg p-6">
                <p className="text-3xl font-bold text-orange-800">
                  {currentQuestion.word.ko}
                </p>
              </div>
              
              <Button
                onClick={handlePlayAudio}
                variant="outline"
                size="sm"
                disabled={!speechService}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-2">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctIndex;
                const isWrong = isSelected && !isCorrect;

                return (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswered}
                    variant={isSelected ? "default" : "outline"}
                    size="lg"
                    className={`
                      transition-all duration-200 text-left justify-start
                      ${isAnswered && isCorrect ? 'bg-green-100 border-green-500 text-green-700' : ''}
                      ${isAnswered && isWrong ? 'bg-red-100 border-red-500 text-red-700' : ''}
                      ${!isAnswered ? 'hover:bg-orange-50 hover:border-orange-300' : ''}
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      {isAnswered && isCorrect && <CheckCircle className="h-5 w-5" />}
                      {isAnswered && isWrong && <XCircle className="h-5 w-5" />}
                      {option}
                    </span>
                  </Button>
                );
              })}
            </div>

            {/* Streak indicator */}
            {streak > 0 && (
              <div className="bg-yellow-100 rounded-lg p-2 animate-pulse">
                <p className="text-yellow-800 font-semibold">
                  🔥 {streak} in a row!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
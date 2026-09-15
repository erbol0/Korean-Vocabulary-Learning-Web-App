'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useVocabularyStore } from '@/stores/vocabulary';
import { useProgressStoreNew } from '@/stores/progress-new';
import { Volume2, ArrowLeft, CheckCircle, XCircle, Trophy, Keyboard, Eye, EyeOff } from 'lucide-react';
import { SpeechService } from '@/utils/speech';
import { shuffleArray } from '@/lib/utils';
import { type VocabularyItem } from '@/lib/types';
import Link from 'next/link';

type Question = {
  word: VocabularyItem & { vi?: string };
  showHint: boolean;
};

export default function TypingGamePage() {
  const { vocabulary, loadVocabulary } = useVocabularyStore();
  const { ensureWord, markResult, addGameResult } = useProgressStoreNew();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [gameStartTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [speechService, setSpeechService] = useState<SpeechService | null>(null);

  useEffect(() => {
    setSpeechService(new SpeechService());
    loadVocabulary();
  }, [loadVocabulary]);

  useEffect(() => {
    if (vocabulary.length >= 4) {
      generateQuestions();
    }
  }, [vocabulary]);

  const generateQuestions = () => {
    if (vocabulary.length < 4) return;

    const gameQuestions: Question[] = [];
    const shuffledVocab = shuffleArray([...vocabulary]);
    const numQuestions = Math.min(15, shuffledVocab.length);

    for (let i = 0; i < numQuestions; i++) {
      const word = shuffledVocab[i];
      gameQuestions.push({
        word,
        showHint: false
      });
      ensureWord(word.id);
    }

    setQuestions(gameQuestions);
    setCurrentIndex(0);
    setUserInput('');
    setShowResult(false);
    setIsAnswered(false);
    setShowHint(false);
  };

  const normalizeText = (text: string) => {
    return text.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  const checkAnswer = () => {
    if (isAnswered || !userInput.trim()) return;

    const currentQuestion = questions[currentIndex];
    const correctAnswer = normalizeText(currentQuestion.word.ko);
    const userAnswer = normalizeText(userInput);
    
    setIsAnswered(true);

    const isCorrect = userAnswer === correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      markResult(currentQuestion.word.id, 3, true);
    } else {
      markResult(currentQuestion.word.id, 0, false);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setUserInput('');
        setIsAnswered(false);
        setShowHint(false);
      } else {
        finishGame();
      }
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnswered) {
      checkAnswer();
    }
  };

  const finishGame = () => {
    const timeSpent = Math.floor((Date.now() - gameStartTime) / 1000);
    
    addGameResult({
      gameType: 'typing',
      score: score * 100,
      correctAnswers: score,
      totalQuestions: questions.length,
      timeSpent,
    });

    setShowResult(true);
  };

  const handlePlayAudio = () => {
    if (questions[currentIndex] && speechService) {
      speechService.speak(questions[currentIndex].word.ko);
    }
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  if (vocabulary.length < 4) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Keyboard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-4">More Vocabulary Needed</h2>
            <p className="text-muted-foreground mb-6">
              You need at least 4 vocabulary words to play the typing game.
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
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-4">Game Complete!</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Score:</span>
                <span className="font-bold">{score}/{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span className="font-bold">{accuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span>XP Earned:</span>
                <span className="font-bold text-green-600">+{score * 100}</span>
              </div>
            </div>
            <div className="space-y-3">
              <Button onClick={() => {
                generateQuestions();
                setScore(0);
              }} className="w-full">
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
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;
  const correctAnswer = currentQuestion.word.ko;
  const isCorrect = isAnswered && normalizeText(userInput) === normalizeText(correctAnswer);
  const isWrong = isAnswered && normalizeText(userInput) !== normalizeText(correctAnswer);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/games">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-semibold">Typing Game</h1>
            <p className="text-sm text-muted-foreground">
              {currentIndex + 1}/{questions.length} - Score: {score}
            </p>
          </div>
          <div className="w-20"></div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-6 animate-slide-up">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-3">
              <Keyboard className="h-6 w-6 text-blue-600" />
              Type in Korean
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {/* English/Meaning */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-lg font-semibold text-blue-800">
                {currentQuestion.word.en || currentQuestion.word.vi}
              </p>
            </div>

            {/* Hint and Audio */}
            <div className="flex justify-center gap-3">
              <Button
                onClick={handlePlayAudio}
                variant="outline"
                size="sm"
                disabled={!speechService}
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Listen
              </Button>
              
              <Button
                onClick={toggleHint}
                variant="outline"
                size="sm"
              >
                {showHint ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </Button>
            </div>

            {/* Hint */}
            {showHint && (
              <div className="bg-yellow-50 rounded-lg p-3 text-sm text-yellow-800 animate-slide-up">
                <p>Hint: {correctAnswer.charAt(0)}{'_'.repeat(correctAnswer.length - 1)}</p>
              </div>
            )}

            {/* Input */}
            <div className="space-y-4">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type the Korean word..."
                className={`
                  text-center text-lg h-12
                  ${isCorrect ? 'border-green-500 bg-green-50' : ''}
                  ${isWrong ? 'border-red-500 bg-red-50' : ''}
                `}
                disabled={isAnswered}
                autoFocus
              />

              {/* Result feedback */}
              {isAnswered && (
                <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
                  isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {isCorrect ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Correct! 🎉</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5" />
                      <span>Correct answer: <strong>{correctAnswer}</strong></span>
                    </>
                  )}
                </div>
              )}

              {!isAnswered && (
                <Button 
                  onClick={checkAnswer} 
                  className="w-full"
                  disabled={!userInput.trim()}
                >
                  Check (Enter)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
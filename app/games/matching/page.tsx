'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useVocabularyStore } from '@/stores/vocabulary';
import { useProgressStoreNew } from '@/stores/progress-new';
import { Volume2, ArrowLeft, CheckCircle, XCircle, Trophy, Shuffle } from 'lucide-react';
import { SpeechService } from '@/utils/speech';
import { shuffleArray } from '@/lib/utils';
import Link from 'next/link';

type MatchPair = {
  id: string;
  ko: string;
  en: string;
  isMatched: boolean;
};

type MatchItem = {
  id: string;
  text: string;
  type: 'korean' | 'english';
  pairId: string;
  isSelected: boolean;
  isMatched: boolean;
};

export default function MatchingGamePage() {
  const { vocabulary, loadVocabulary } = useVocabularyStore();
  const { ensureWord, markResult, addGameResult } = useProgressStoreNew();
  
  const [pairs, setPairs] = useState<MatchPair[]>([]);
  const [items, setItems] = useState<MatchItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<MatchItem[]>([]);
  const [score, setScore] = useState(0);
  const [gameStartTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);
  const [speechService, setSpeechService] = useState<SpeechService | null>(null);
  const [matchedPairs, setMatchedPairs] = useState(0);

  useEffect(() => {
    setSpeechService(new SpeechService());
    loadVocabulary();
  }, [loadVocabulary]);

  useEffect(() => {
    if (vocabulary.length >= 4) {
      generateGame();
    }
  }, [vocabulary]);

  const generateGame = () => {
    if (vocabulary.length < 4) return;

    const shuffledVocab = shuffleArray([...vocabulary]);
    const numPairs = Math.min(8, shuffledVocab.length);
    const selectedWords = shuffledVocab.slice(0, numPairs);

    // Create pairs
    const gamePairs: MatchPair[] = selectedWords.map(word => ({
      id: word.id,
      ko: word.ko,
      en: word.en || word.en || '',
      isMatched: false
    }));

    // Create items (Korean and English words mixed)
    const gameItems: MatchItem[] = [];
    
    gamePairs.forEach(pair => {
      gameItems.push({
        id: `ko-${pair.id}`,
        text: pair.ko,
        type: 'korean',
        pairId: pair.id,
        isSelected: false,
        isMatched: false
      });
      
      gameItems.push({
        id: `en-${pair.id}`,
        text: pair.en,
        type: 'english',
        pairId: pair.id,
        isSelected: false,
        isMatched: false
      });

      ensureWord(pair.id);
    });

    // Shuffle the items
    const shuffledItems = shuffleArray(gameItems);

    setPairs(gamePairs);
    setItems(shuffledItems);
    setSelectedItems([]);
    setScore(0);
    setMatchedPairs(0);
    setShowResult(false);
  };

  const handleItemClick = (clickedItem: MatchItem) => {
    if (clickedItem.isMatched || clickedItem.isSelected || selectedItems.length >= 2) {
      return;
    }

    const newSelectedItems = [...selectedItems, clickedItem];
    setSelectedItems(newSelectedItems);

    // Update item selection state
    setItems(prev => prev.map(item => 
      item.id === clickedItem.id 
        ? { ...item, isSelected: true }
        : item
    ));

    if (newSelectedItems.length === 2) {
      const [first, second] = newSelectedItems;
      const isMatch = first.pairId === second.pairId && first.type !== second.type;

      setTimeout(() => {
        if (isMatch) {
          // Correct match
          setScore(score + 1);
          setMatchedPairs(matchedPairs + 1);
          
          // Mark items as matched
          setItems(prev => prev.map(item => 
            item.pairId === first.pairId
              ? { ...item, isMatched: true, isSelected: false }
              : { ...item, isSelected: false }
          ));

          // Mark result for vocabulary tracking
          markResult(first.pairId, 3, true);

          // Check if game is complete
          if (matchedPairs + 1 === pairs.length) {
            setTimeout(() => finishGame(), 1000);
          }
        } else {
          // Incorrect match
          setItems(prev => prev.map(item => ({ ...item, isSelected: false })));
          markResult(first.pairId, 1, false);
        }
        
        setSelectedItems([]);
      }, 800);
    }
  };

  const finishGame = () => {
    const timeSpent = Math.floor((Date.now() - gameStartTime) / 1000);
    
    addGameResult({
      gameType: 'matching',
      score: score * 100,
      correctAnswers: score,
      totalQuestions: pairs.length,
      timeSpent,
    });

    setShowResult(true);
  };

  const handlePlayAudio = (text: string) => {
    if (speechService) {
      speechService.speak(text);
    }
  };

  if (vocabulary.length < 4) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Shuffle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-4">More Vocabulary Needed</h2>
            <p className="text-muted-foreground mb-6">
              You need at least 4 vocabulary words to play the matching game.
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
    const accuracy = Math.round((score / pairs.length) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-4">Completed!</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Matched Pairs:</span>
                <span className="font-bold">{score}/{pairs.length}</span>
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
                generateGame();
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

  if (pairs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading game...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = (matchedPairs / pairs.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/games">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-semibold">Matching Game</h1>
            <p className="text-sm text-muted-foreground">
              {matchedPairs}/{pairs.length} pairs - Score: {score}
            </p>
          </div>
          <div className="w-20"></div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Instructions */}
        <Card className="mb-6">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Shuffle className="h-5 w-5 text-green-600" />
              <p className="font-semibold">Match Korean words with English meanings</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Select 2 words to pair them. Click on the Korean word to hear its pronunciation.
            </p>
          </CardContent>
        </Card>

        {/* Game Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((item) => {
            const isKorean = item.type === 'korean';
            const isSelected = item.isSelected;
            const isMatched = item.isMatched;

            return (
              <Card 
                key={item.id}
                className={`
                  cursor-pointer transition-all duration-300 transform hover:scale-105
                  ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                  ${isMatched ? 'bg-green-100 border-green-500 ring-2 ring-green-300' : ''}
                  ${!isMatched && !isSelected ? 'hover:bg-gray-50 hover:border-gray-300' : ''}
                  ${isMatched ? 'cursor-default' : ''}
                `}
                onClick={() => handleItemClick(item)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 min-h-[60px]">
                    {isKorean && speechService && !isMatched && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayAudio(item.text);
                        }}
                        className="p-1 h-6 w-6"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="flex-1">
                      <p className={`
                        font-medium break-words
                        ${isKorean ? 'text-blue-700' : 'text-purple-700'}
                        ${isMatched ? 'text-green-700' : ''}
                      `}>
                        {item.text}
                      </p>
                      <p className={`
                        text-xs mt-1
                        ${isKorean ? 'text-blue-500' : 'text-purple-500'}
                        ${isMatched ? 'text-green-500' : ''}
                      `}>
                        {isKorean ? '한국어' : 'English'}
                      </p>
                    </div>
                    {isMatched && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Selected items indicator */}
        {selectedItems.length > 0 && (
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-center text-blue-700">
                Selected: {selectedItems.map(item => item.text).join(' + ')}
                {selectedItems.length === 2 && ' - Checking...'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
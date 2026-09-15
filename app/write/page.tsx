"use client";

import { useState, useEffect } from "react";
import { HandwritingPad, type Drawing } from "@/components/HandwritingPad";
import { scoreHandwriting, type HandwritingScore } from "@/lib/handwriting-score";
import { useVocabularyStore } from "@/stores/vocabulary";
import { useProgressStore } from "@/stores/progress";
import { getRandomElements } from "@/lib/utils";
import { AnswerQuality } from "@/utils/spaced-repetition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RotateCcw, CheckCircle2, Circle, Volume2 } from "lucide-react";

export default function WritePage() {
  const { vocabulary, loadVocabulary } = useVocabularyStore();
  const { updateVocabProgress } = useProgressStore();
  const [drawing, setDrawing] = useState<Drawing>([]);
  const [currentWord, setCurrentWord] = useState<any>(null);
  const [score, setScore] = useState<HandwritingScore | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Get random word function
  const getRandomWord = () => {
    if (vocabulary.length === 0) return null;
    const randomWords = getRandomElements(vocabulary, 1);
    return randomWords[0] || null;
  };

  // Load vocabulary on mount
  useEffect(() => {
    loadVocabulary();
  }, [loadVocabulary]);

  // Get random word when vocabulary loads
  useEffect(() => {
    if (vocabulary.length > 0 && !currentWord) {
      const word = getRandomWord();
      setCurrentWord(word);
    }
  }, [vocabulary, currentWord]);

  // Pronounce word
  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleGrade = async () => {
    if (!currentWord || drawing.length === 0) return;

    setIsScoring(true);
    setShowFeedback(false);

    try {
      // Small delay for smooth UI feedback
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = scoreHandwriting(drawing, currentWord.ko);
      setScore(result);
      setShowFeedback(true);

      // Update progress
      const quality: AnswerQuality = result.score >= 80 ? AnswerQuality.EASY : 
                                     result.score >= 60 ? AnswerQuality.GOOD : 
                                     result.score >= 40 ? AnswerQuality.HARD : AnswerQuality.FORGOT;
      updateVocabProgress(currentWord.id, quality);
    } catch (error) {
      console.error("Scoring error:", error);
      setScore({
        score: 0,
        feedback: "An error occurred while scoring. Please try again!",
        accuracy: 0
      });
      setShowFeedback(true);
    } finally {
      setIsScoring(false);
    }
  };

  const getNextWord = () => {
    const word = getRandomWord();
    setCurrentWord(word);
    setDrawing([]);
    setScore(null);
    setShowFeedback(false);
  };

  const clearDrawing = () => {
    setDrawing([]);
    setScore(null);
    setShowFeedback(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 50) return <CheckCircle2 className="w-5 h-5" />;
    return <Circle className="w-5 h-5" />;
  };

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading vocabulary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            ✍️ Korean Handwriting Practice
          </h1>
          <p className="text-slate-600">
            Trace over the guide text and get evaluated by AI
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Current Word Card */}
          <Card className="border-2 border-slate-200 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-700">
                  Target Word
                </CardTitle>
                <Badge variant="outline" className="text-sm">
                  {currentWord.tags?.[0] || "TOPIK"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Korean word display */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-6xl md:text-7xl font-bold text-slate-800 tracking-wider">
                    {currentWord.ko}
                  </span>
                  <Button
                    onClick={() => speakWord(currentWord.ko)}
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Volume2 className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-lg text-slate-600 font-medium">
                  {currentWord.en || currentWord.en}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Handwriting Pad */}
          <Card className="border-2 border-slate-200 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-6">
                <HandwritingPad
                  width={320}
                  height={320}
                  onChange={setDrawing}
                  templateText={currentWord.ko}
                  showTemplate={true}
                />

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleGrade}
                    disabled={drawing.length === 0 || isScoring}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg"
                  >
                    {isScoring ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Scoring...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Check Score
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={getNextWord}
                    variant="outline"
                    className="px-6 py-3 border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-xl"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Next Word
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Display */}
          {showFeedback && score && (
            <Card className={`border-2 shadow-lg ${getScoreColor(score.score)}`}>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    {getScoreIcon(score.score)}
                    <span className="text-2xl font-bold">
                      {score.score}/100 pts
                    </span>
                  </div>
                  
                  <p className="text-lg font-medium">
                    {score.feedback}
                  </p>
                  
                  <div className="text-sm opacity-70">
                    Accuracy: {Math.round(score.accuracy * 100)}%
                  </div>

                  {score.score >= 50 && (
                    <div className="text-sm font-medium text-green-700 bg-green-100 px-4 py-2 rounded-full inline-block">
                      ✓ Saved to your learning progress!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="border border-slate-200 bg-slate-50/50">
            <CardContent className="p-4">
              <div className="text-sm text-slate-600 space-y-2">
                <p className="font-semibold">💡 Instructions:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Trace over the faded template text on the canvas</li>
                  <li>• Pay attention to stroke shapes and proportions</li>
                  <li>• Score 50+ points to pass this word</li>
                  <li>• Use Undo to erase your last stroke, or Clear to reset</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { Upload, FileText, Download, AlertCircle, CheckCircle2, XCircle, Database, BookOpen, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Label } from '../../components/ui/label';
import { parseVocabularyData, parseCSVData } from '../../utils/import-parser';
import { useVocabularyStore } from '../../stores/vocabulary';
import { sampleTSVData, sampleVocabulary } from '../../data/sample-vocab';
import { TOPIK1_VOCABULARY } from '../../data/vocabulary';
import { generateId } from '../../lib/utils';

export default function ImportPage() {
  const [importData, setImportData] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [preloadStatus, setPreloadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const { addVocabulary, getVocabularyCount } = useVocabularyStore();
  const currentVocabCount = getVocabularyCount();

  const handlePreloadTOPIK1 = async () => {
    setPreloadStatus('loading');
    try {
      // Convert TOPIK1_VOCABULARY to the correct format
      const vocabItems = TOPIK1_VOCABULARY.map(word => ({
        id: generateId(),
        ko: word.korean,
        en: word.english,
        tags: word.category ? [word.category] : [],
        addedAt: Date.now(),
        srsLevel: 0,
        nextReview: Date.now(),
        correctStreak: 0,
        totalReviews: 0
      }));

      await addVocabulary(vocabItems);
      setPreloadStatus('success');
      
      // Auto hide success message after 3 seconds
      setTimeout(() => setPreloadStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to preload TOPIK 1 vocabulary:', error);
      setPreloadStatus('error');
      setTimeout(() => setPreloadStatus('idle'), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Import Vocabulary</h1>
        <p className="text-muted-foreground">
          Add vocabulary to your library. Currently you have <strong>{currentVocabCount}</strong> words.
        </p>
      </div>

      {/* TOPIK 1 Pre-load Section */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-blue-800">TOPIK 1 Vocabulary Pack</CardTitle>
              <CardDescription className="text-blue-600">
                {TOPIK1_VOCABULARY.length} carefully curated TOPIK 1 vocabulary words
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-2">Includes topics:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <span>• Basic Vocabulary</span>
                <span>• Family & Relationships</span>
                <span>• Food & Drinks</span>
                <span>• Transportation & Travel</span>
                <span>• Time & Places</span>
                <span>• Work & Education</span>
                <span>• Health & Body</span>
                <span>• Daily Activities</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={handlePreloadTOPIK1}
                disabled={preloadStatus === 'loading'}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                size="lg"
              >
                {preloadStatus === 'loading' ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : preloadStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Successfully added!
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Import {TOPIK1_VOCABULARY.length} TOPIK 1 words
                  </>
                )}
              </Button>

              {preloadStatus === 'success' && (
                <span className="text-sm text-green-600 font-medium">
                  ✅ Added {TOPIK1_VOCABULARY.length} words to library
                </span>
              )}
              
              {preloadStatus === 'error' && (
                <span className="text-sm text-red-600 font-medium">
                  ❌ An error occurred, please try again
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-800 text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            💡 Import Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-700 space-y-3">
          <div>
            <p className="font-semibold mb-2">Current Features:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>✅ TOPIK 1 Pack:</strong> {TOPIK1_VOCABULARY.length} carefully selected vocabulary words</li>
              <li><strong>✅ One-click Import:</strong> Instantly load a full vocabulary set with a single click</li>
              <li><strong>✅ Categorized Topics:</strong> Easily search and review by category</li>
              <li><strong>✅ SRS Integration:</strong> Smart spaced repetition system</li>
            </ul>
          </div>
          
          <div>
            <p className="font-semibold mb-1">Coming Soon:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Import from CSV/Excel files</li>
              <li>Import from text in various formats</li>
              <li>Detailed vocabulary editing and management</li>
              <li>Data export and backup</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
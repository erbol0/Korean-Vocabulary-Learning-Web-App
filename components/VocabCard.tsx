import React from 'react';
import { VocabularyItem } from '../lib/types';
import { romanizeKorean } from '../utils/romanization';
import { AudioPlayer } from './AudioPlayer';
import { Card, CardContent } from './ui/card';
import { useSettingsStore } from '../stores/settings';

interface VocabCardProps {
  item: VocabularyItem;
  showRomanization?: boolean;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  className?: string;
  onClick?: () => void;
}

export function VocabCard({ 
  item, 
  showRomanization, 
  onToggleFavorite, 
  isFavorite = false, 
  className = '',
  onClick
}: VocabCardProps) {
  const { showRomanization: globalShowRomanization } = useSettingsStore();
  const shouldShowRomanization = showRomanization ?? globalShowRomanization;
  
  const romanized = shouldShowRomanization ? romanizeKorean(item.ko) : '';

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* Korean Word */}
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-primary">
                {item.ko}
              </div>
              <AudioPlayer text={item.ko} size="sm" />
            </div>

            {/* Romanization */}
            {shouldShowRomanization && romanized && (
              <div className="text-sm text-muted-foreground font-mono">
                [{romanized}]
              </div>
            )}

            {/* English Meaning */}
            <div className="text-base text-foreground">
              {item.en || item.en}
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* STT / Index Number */}
          {item.stt && (
            <div className="text-sm text-muted-foreground font-mono ml-4">
              #{item.stt}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface VocabListProps {
  items: VocabularyItem[];
  showRomanization?: boolean;
  onItemClick?: (item: VocabularyItem) => void;
  className?: string;
}

export function VocabList({ 
  items, 
  showRomanization, 
  onItemClick, 
  className = '' 
}: VocabListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-lg">No vocabulary items found</p>
        <p className="text-sm">Import vocabulary data to start learning</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item) => (
        <VocabCard
          key={item.id}
          item={item}
          showRomanization={showRomanization}
          className={onItemClick ? 'cursor-pointer hover:bg-accent/10' : ''}
          onClick={() => onItemClick?.(item)}
        />
      ))}
    </div>
  );
}
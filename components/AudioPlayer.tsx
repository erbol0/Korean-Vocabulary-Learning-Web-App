import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { useSpeechService } from '../utils/speech';
import { useSettingsStore } from '../stores/settings';

interface AudioPlayerProps {
  text: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AudioPlayer({ text, showText = false, size = 'md', className = '' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const speechService = useSpeechService();
  const { audioSettings } = useSettingsStore();

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const handleSpeak = async () => {
    if (!speechService || !audioSettings.enabled) return;

    if (speechService.isSpeaking()) {
      speechService.cancel();
      setIsPlaying(false);
      return;
    }

    try {
      setIsLoading(true);
      setIsPlaying(true);
      
      await speechService.speak(text, {
        rate: audioSettings.rate,
        pitch: audioSettings.pitch
      });
      
      setIsPlaying(false);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakSlow = async () => {
    if (!speechService || !audioSettings.enabled) return;

    try {
      setIsLoading(true);
      setIsPlaying(true);
      
      await speechService.speakSlow(text);
      
      setIsPlaying(false);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepeat = async () => {
    if (!speechService || !audioSettings.enabled) return;

    try {
      setIsLoading(true);
      setIsPlaying(true);
      
      await speechService.speakRepeat(text, 2);
      
      setIsPlaying(false);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if Korean voice is available
  const isKoreanVoiceAvailable = speechService?.isKoreanVoiceAvailable() ?? false;

  if (!speechService || !isKoreanVoiceAvailable) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground text-sm ${className}`}>
        <VolumeX size={iconSizes[size]} />
        {showText && <span>Korean voice unavailable</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showText && (
        <span className="text-sm font-medium">{text}</span>
      )}
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size={size === 'sm' ? 'sm' : 'default'}
          onClick={handleSpeak}
          disabled={isLoading || !audioSettings.enabled}
          className="h-8 w-8 p-0"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          ) : isPlaying ? (
            <VolumeX size={iconSizes[size]} />
          ) : (
            <Volume2 size={iconSizes[size]} />
          )}
        </Button>

        {size !== 'sm' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSpeakSlow}
              disabled={isLoading || !audioSettings.enabled}
              className="h-8 px-2 text-xs"
              title="Listen slow"
            >
              Slow
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRepeat}
              disabled={isLoading || !audioSettings.enabled}
              className="h-8 w-8 p-0"
              title="Repeat twice"
            >
              <RotateCcw size={14} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
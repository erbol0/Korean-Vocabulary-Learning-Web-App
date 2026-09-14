'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AudioSettings, ThemeConfig } from '../lib/types';

interface SettingsStore {
  // Theme settings
  isDarkMode: boolean;
  currentTheme: string;
  themes: ThemeConfig[];
  
  // Audio settings
  audioSettings: AudioSettings;
  
  // Study settings
  dailyGoal: number;
  sessionSize: number;
  autoAdvance: boolean;
  
  // Game settings
  defaultDifficulty: 'easy' | 'medium' | 'hard';
  showRomanization: boolean;
  enableHints: boolean;
  
  // Actions
  toggleDarkMode: () => void;
  setTheme: (themeName: string) => void;
  updateAudioSettings: (settings: Partial<AudioSettings>) => void;
  updateStudySettings: (settings: { dailyGoal?: number; sessionSize?: number; autoAdvance?: boolean }) => void;
  updateGameSettings: (settings: { defaultDifficulty?: 'easy' | 'medium' | 'hard'; showRomanization?: boolean; enableHints?: boolean }) => void;
}

const defaultThemes: ThemeConfig[] = [
  {
    name: 'default',
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#ffffff',
    foreground: '#1f2937'
  },
  {
    name: 'purple',
    primary: '#8b5cf6',
    secondary: '#ec4899',
    background: '#ffffff',
    foreground: '#1f2937'
  },
  {
    name: 'green',
    primary: '#10b981',
    secondary: '#06b6d4',
    background: '#ffffff',
    foreground: '#1f2937'
  }
];

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Theme settings
      isDarkMode: false,
      currentTheme: 'default',
      themes: defaultThemes,
      
      // Audio settings
      audioSettings: {
        enabled: true,
        rate: 1.0,
        pitch: 1.0,
        autoplay: false
      },
      
      // Study settings
      dailyGoal: 20,
      sessionSize: 10,
      autoAdvance: false,
      
      // Game settings
      defaultDifficulty: 'medium',
      showRomanization: true,
      enableHints: true,

      toggleDarkMode: () => {
        set({ isDarkMode: !get().isDarkMode });
      },

      setTheme: (themeName: string) => {
        const { themes } = get();
        const theme = themes.find(t => t.name === themeName);
        if (theme) {
          set({ currentTheme: themeName });
          
          // Apply CSS variables
          if (typeof document !== 'undefined') {
            const root = document.documentElement;
            root.style.setProperty('--color-primary', theme.primary);
            root.style.setProperty('--color-secondary', theme.secondary);
            root.style.setProperty('--color-background', theme.background);
            root.style.setProperty('--color-foreground', theme.foreground);
          }
        }
      },

      updateAudioSettings: (settings: Partial<AudioSettings>) => {
        set({
          audioSettings: { ...get().audioSettings, ...settings }
        });
      },

      updateStudySettings: (settings) => {
        set(settings);
      },

      updateGameSettings: (settings) => {
        set(settings);
      }
    }),
    {
      name: 'settings-storage'
    }
  )
);
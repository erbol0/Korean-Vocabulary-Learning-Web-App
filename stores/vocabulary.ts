'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VocabularyItem } from '../lib/types';
import { VocabDatabase } from '../lib/database';
import { generateId } from '../lib/utils';

interface VocabularyStore {
  vocabulary: VocabularyItem[];
  isLoading: boolean;
  searchQuery: string;
  selectedTags: string[];
  
  // Actions
  loadVocabulary: () => Promise<void>;
  addVocabulary: (items: VocabularyItem[]) => Promise<void>;
  updateVocabularyItem: (id: string, updates: Partial<VocabularyItem>) => Promise<void>;
  deleteVocabularyItem: (id: string) => Promise<void>;
  searchVocabulary: (query: string) => void;
  filterByTags: (tags: string[]) => void;
  clearFilters: () => void;
  
  // Getters
  getFilteredVocabulary: () => VocabularyItem[];
  getAllTags: () => string[];
  getVocabularyCount: () => number;
}

export const useVocabularyStore = create<VocabularyStore>((set, get) => ({
  vocabulary: [],
  isLoading: false,
  searchQuery: '',
  selectedTags: [],

  loadVocabulary: async () => {
    set({ isLoading: true });
    try {
      const vocabulary = await VocabDatabase.getVocabulary();
      set({ vocabulary, isLoading: false });
    } catch (error) {
      console.error('Failed to load vocabulary:', error);
      set({ isLoading: false });
    }
  },

  addVocabulary: async (items: VocabularyItem[]) => {
    set({ isLoading: true });
    try {
      // Generate IDs for items that don't have them
      const itemsWithIds = items.map(item => ({
        ...item,
        id: item.id || generateId(),
        addedAt: item.addedAt || Date.now()
      }));

      await VocabDatabase.addVocabulary(itemsWithIds);
      const { vocabulary } = get();
      set({ 
        vocabulary: [...vocabulary, ...itemsWithIds],
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to add vocabulary:', error);
      set({ isLoading: false });
    }
  },

  updateVocabularyItem: async (id: string, updates: Partial<VocabularyItem>) => {
    try {
      await VocabDatabase.updateVocabulary(id, updates);
      const { vocabulary } = get();
      set({
        vocabulary: vocabulary.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      });
    } catch (error) {
      console.error('Failed to update vocabulary item:', error);
    }
  },

  deleteVocabularyItem: async (id: string) => {
    try {
      await VocabDatabase.deleteVocabulary(id);
      const { vocabulary } = get();
      set({
        vocabulary: vocabulary.filter(item => item.id !== id)
      });
    } catch (error) {
      console.error('Failed to delete vocabulary item:', error);
    }
  },

  searchVocabulary: (query: string) => {
    set({ searchQuery: query });
  },

  filterByTags: (tags: string[]) => {
    set({ selectedTags: tags });
  },

  clearFilters: () => {
    set({ searchQuery: '', selectedTags: [] });
  },

  getFilteredVocabulary: () => {
    const { vocabulary, searchQuery, selectedTags } = get();
    
    let filtered = vocabulary;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.ko.toLowerCase().includes(query) ||
        item.vi.toLowerCase().includes(query)
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item =>
        item.tags && item.tags.some(tag => selectedTags.includes(tag))
      );
    }

    return filtered;
  },

  getAllTags: () => {
    const { vocabulary } = get();
    const tagSet = new Set<string>();
    
    vocabulary.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => tagSet.add(tag));
      }
    });
    
    return Array.from(tagSet).sort();
  },

  getVocabularyCount: () => {
    return get().vocabulary.length;
  }
}));
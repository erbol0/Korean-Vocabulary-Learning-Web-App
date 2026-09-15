import { VocabularyItem } from '../lib/types';
import { generateId, normalizeKorean, normalizeEnglish } from '../lib/utils';

export interface ParseResult {
  success: boolean;
  items: VocabularyItem[];
  errors: string[];
  totalLines: number;
  validLines: number;
}

export function parseVocabularyData(data: string): ParseResult {
  const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const items: VocabularyItem[] = [];
  const errors: string[] = [];
  let validLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const line = lines[i];
    
    // Skip header lines or empty lines
    const lineLower = line.toLowerCase();
    if ((lineLower.includes('stt') || lineLower.includes('no')) && 
        (lineLower.includes('korean') || lineLower.includes('word') || lineLower.includes('từ vựng'))) {
      continue;
    }

    try {
      const item = parseLine(line, lineNumber);
      if (item) {
        items.push(item);
        validLines++;
      }
    } catch (error) {
      errors.push(`Line ${lineNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    success: errors.length === 0,
    items,
    errors,
    totalLines: lines.length,
    validLines
  };
}

function parseLine(line: string, lineNumber: number): VocabularyItem | null {
  // Split by tab first, then by multiple spaces as fallback
  let parts = line.split('\t');
  if (parts.length < 3) {
    parts = line.split(/\s{2,}/); // Split by 2 or more spaces
  }
  
  if (parts.length < 2) {
    throw new Error('Line must contain at least Korean word and English meaning');
  }

  let stt: number | undefined;
  let ko: string;
  let en: string;
  let vi: string | undefined;

  if (parts.length >= 3) {
    // Format: STT | Korean | English
    const sttStr = parts[0].trim();
    ko = parts[1].trim();
    en = parts[2].trim();
    
    // Try to parse STT
    const sttNum = parseInt(sttStr, 10);
    if (!isNaN(sttNum)) {
      stt = sttNum;
    }
  } else {
    // Format: Korean | English
    ko = parts[0].trim();
    en = parts[1].trim();
  }

  // Validation
  if (!ko || !en) {
    throw new Error('Both Korean word and English meaning are required');
  }

  // Check if Korean contains Hangul characters
  const hasHangul = /[\u3131-\uD79D]/.test(ko);
  if (!hasHangul) {
    console.warn(`Line ${lineNumber}: "${ko}" doesn't contain Hangul characters`);
  }

  // Generate tags based on content
  const tags = generateTags(ko, en);

  return {
    id: generateId(),
    stt,
    ko: ko.trim(),
    en: en.trim(),
    vi: en.trim(), // Keep vi populated as a fallback for backward compatibility
    tags,
    addedAt: Date.now()
  };
}

function generateTags(ko: string, en: string): string[] {
  const tags: string[] = [];
  const enLower = en.toLowerCase();
  
  // Basic categorization based on English meaning
  if (enLower.includes('color') || enLower.includes('colour') || enLower.includes('red') || enLower.includes('blue')) {
    tags.push('colors');
  }
  if (enLower.includes('food') || enLower.includes('drink') || enLower.includes('eat') || enLower.includes('dish')) {
    tags.push('food');
  }
  if (enLower.includes('family') || enLower.includes('brother') || enLower.includes('sister') || enLower.includes('parent')) {
    tags.push('family');
  }
  if (enLower.includes('time') || enLower.includes('day') || enLower.includes('month') || enLower.includes('year')) {
    tags.push('time');
  }
  if (enLower.includes('body') || enLower.includes('head') || enLower.includes('hand') || enLower.includes('foot')) {
    tags.push('body');
  }
  if (enLower.includes('job') || enLower.includes('work') || enLower.includes('career') || enLower.includes('profession')) {
    tags.push('occupation');
  }
  if (enLower.includes('study') || enLower.includes('school') || enLower.includes('learn') || enLower.includes('teacher')) {
    tags.push('education');
  }
  
  return tags;
}

export function exportVocabularyData(items: VocabularyItem[]): string {
  const header = 'No.\tKorean\tEnglish\tTags\tDate Added';
  const rows = items.map((item, index) => {
    const stt = item.stt || index + 1;
    const meaning = item.en || item.en || '';
    const tags = item.tags?.join(', ') || '';
    const addedDate = item.addedAt ? new Date(item.addedAt).toLocaleDateString('en-US') : '';
    return `${stt}\t${item.ko}\t${meaning}\t${tags}\t${addedDate}`;
  });
  
  return [header, ...rows].join('\n');
}

export function parseCSVData(csvText: string): ParseResult {
  // Simple CSV parser - assumes comma-separated values
  const lines = csvText.split('\n');
  const items: VocabularyItem[] = [];
  const errors: string[] = [];
  let validLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Skip header line
    const lineLower = line.toLowerCase();
    if (i === 0 && (lineLower.includes('korean') || lineLower.includes('word') || lineLower.includes('từ vựng'))) {
      continue;
    }

    try {
      // Simple CSV parsing - handle commas within quotes
      const columns = parseCSVLine(line);
      
      if (columns.length < 2) {
        errors.push(`Line ${lineNumber}: Need at least Korean word and English meaning`);
        continue;
      }

      let stt: number | undefined;
      let ko: string;
      let en: string;

      if (columns.length >= 3 && !isNaN(parseInt(columns[0].trim()))) {
        stt = parseInt(columns[0].trim());
        ko = columns[1].trim();
        en = columns[2].trim();
      } else {
        ko = columns[0].trim();
        en = columns[1].trim();
      }

      if (!ko || !en) {
        errors.push(`Line ${lineNumber}: Missing Korean word or English meaning`);
        continue;
      }

      items.push({
        id: generateId(),
        stt,
        ko,
        en,
        vi: en, // Fallback for backward compatibility
        tags: generateTags(ko, en),
        addedAt: Date.now()
      });

      validLines++;
    } catch (error) {
      errors.push(`Line ${lineNumber}: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  }

  return {
    success: errors.length === 0,
    items,
    errors,
    totalLines: lines.length,
    validLines
  };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}
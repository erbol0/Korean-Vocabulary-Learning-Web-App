// Korean to Latin romanization
// Basic consonant mapping
const consonants: { [key: string]: string } = {
  'ㄱ': 'g', 'ㄲ': 'gg', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'dd',
  'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'bb', 'ㅅ': 's',
  'ㅆ': 'ss', 'ㅇ': '', 'ㅈ': 'j', 'ㅉ': 'jj', 'ㅊ': 'ch',
  'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h'
};

// Basic vowel mapping
const vowels: { [key: string]: string } = {
  'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae', 'ㅓ': 'eo',
  'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye', 'ㅗ': 'o', 'ㅘ': 'wa',
  'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wo',
  'ㅞ': 'we', 'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅢ': 'ui',
  'ㅣ': 'i'
};

// Final consonants (받침)
const finalConsonants: { [key: string]: string } = {
  'ㄱ': 'k', 'ㄲ': 'k', 'ㄳ': 'k', 'ㄴ': 'n', 'ㄵ': 'n',
  'ㄶ': 'n', 'ㄷ': 't', 'ㄹ': 'l', 'ㄺ': 'k', 'ㄻ': 'm',
  'ㄼ': 'l', 'ㄽ': 'l', 'ㄾ': 'l', 'ㄿ': 'p', 'ㅀ': 'l',
  'ㅁ': 'm', 'ㅂ': 'p', 'ㅄ': 'p', 'ㅅ': 't', 'ㅆ': 't',
  'ㅇ': 'ng', 'ㅈ': 't', 'ㅊ': 't', 'ㅋ': 'k', 'ㅌ': 't',
  'ㅍ': 'p', 'ㅎ': 't'
};

export function romanizeKorean(korean: string): string {
  if (!korean) return '';
  
  const result: string[] = [];
  
  for (let i = 0; i < korean.length; i++) {
    const char = korean[i];
    const code = char.charCodeAt(0);
    
    // Check if it's a Hangul syllable (가-힣)
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const syllableIndex = code - 0xAC00;
      
      // Decompose the syllable
      const initialConsonantIndex = Math.floor(syllableIndex / 588);
      const vowelIndex = Math.floor((syllableIndex % 588) / 28);
      const finalConsonantIndex = syllableIndex % 28;
      
      // Get the jamo characters
      const initialConsonant = String.fromCharCode(0x1100 + initialConsonantIndex);
      const vowel = String.fromCharCode(0x1161 + vowelIndex);
      const finalConsonant = finalConsonantIndex > 0 ? 
        String.fromCharCode(0x11A7 + finalConsonantIndex) : '';
      
      // Convert to romanization
      const romanizedInitial = consonants[initialConsonant] || '';
      const romanizedVowel = vowels[vowel] || '';
      const romanizedFinal = finalConsonant ? (finalConsonants[finalConsonant] || '') : '';
      
      result.push(romanizedInitial + romanizedVowel + romanizedFinal);
    } else if (char === ' ') {
      result.push(' ');
    } else {
      result.push(char);
    }
  }
  
  return result.join('');
}

// Simple fallback for browsers that don't support complex romanization
export function simpleRomanize(korean: string): string {
  if (!korean) return '';
  
  // Basic mapping for common characters
  const basicMapping: { [key: string]: string } = {
    '가': 'ga', '나': 'na', '다': 'da', '라': 'ra', '마': 'ma',
    '바': 'ba', '사': 'sa', '아': 'a', '자': 'ja', '차': 'cha',
    '카': 'ka', '타': 'ta', '파': 'pa', '하': 'ha',
    '게': 'ge', '네': 'ne', '데': 'de', '레': 're', '메': 'me',
    '베': 'be', '세': 'se', '에': 'e', '제': 'je', '체': 'che',
    '케': 'ke', '테': 'te', '페': 'pe', '헤': 'he',
    '고': 'go', '노': 'no', '도': 'do', '로': 'ro', '모': 'mo',
    '보': 'bo', '소': 'so', '오': 'o', '조': 'jo', '초': 'cho',
    '코': 'ko', '토': 'to', '포': 'po', '호': 'ho',
    '구': 'gu', '누': 'nu', '두': 'du', '루': 'ru', '무': 'mu',
    '부': 'bu', '수': 'su', '우': 'u', '주': 'ju', '추': 'chu',
    '쿠': 'ku', '투': 'tu', '푸': 'pu', '후': 'hu',
    '그': 'geu', '느': 'neu', '드': 'deu', '르': 'reu', '므': 'meu',
    '브': 'beu', '스': 'seu', '으': 'eu', '즈': 'jeu', '츠': 'cheu',
    '크': 'keu', '트': 'teu', '프': 'peu', '흐': 'heu',
    '기': 'gi', '니': 'ni', '디': 'di', '리': 'ri', '미': 'mi',
    '비': 'bi', '시': 'si', '이': 'i', '지': 'ji', '치': 'chi',
    '키': 'ki', '티': 'ti', '피': 'pi', '히': 'hi'
  };
  
  let result = '';
  for (let i = 0; i < korean.length; i++) {
    const char = korean[i];
    if (char === ' ') {
      result += ' ';
    } else {
      result += basicMapping[char] || char;
    }
  }
  
  return result;
}
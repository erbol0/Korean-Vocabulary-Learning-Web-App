import { AudioSettings } from '../lib/types';

export class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private settings: AudioSettings;

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
    }
    this.settings = {
      enabled: true,
      rate: 1.0,
      pitch: 1.0,
      autoplay: false
    };
    this.loadVoices();
  }

  private loadVoices(): void {
    if (!this.synth) return;
    
    this.voices = this.synth.getVoices();
    
    // If voices aren't loaded yet, wait for the voiceschanged event
    if (this.voices.length === 0) {
      this.synth.addEventListener('voiceschanged', () => {
        if (this.synth) {
          this.voices = this.synth.getVoices();
          this.selectBestKoreanVoice();
        }
      });
    } else {
      this.selectBestKoreanVoice();
    }
  }

  private selectBestKoreanVoice(): void {
    // Find the best Korean voice
    const koreanVoices = this.voices.filter(voice => 
      voice.lang.startsWith('ko') || voice.lang.includes('kr')
    );
    
    if (koreanVoices.length > 0) {
      // Prefer local voices over remote ones
      const localKoreanVoices = koreanVoices.filter(voice => voice.localService);
      const selectedVoice = localKoreanVoices.length > 0 ? localKoreanVoices[0] : koreanVoices[0];
      this.settings.voice = selectedVoice.name;
    }
  }

  public getKoreanVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => 
      voice.lang.startsWith('ko') || voice.lang.includes('kr')
    );
  }

  public isKoreanVoiceAvailable(): boolean {
    return this.getKoreanVoices().length > 0;
  }

  public speak(text: string, options?: Partial<AudioSettings>): Promise<void> {
    if (!this.synth || !this.settings.enabled) {
      return Promise.resolve();
    }

    if (!this.isKoreanVoiceAvailable()) {
      console.warn('No Korean voice available');
      return Promise.reject(new Error('No Korean voice available'));
    }

    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synth!.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice
      if (this.settings.voice) {
        const voice = this.voices.find(v => v.name === this.settings.voice);
        if (voice) {
          utterance.voice = voice;
        }
      }

      // Apply settings
      utterance.rate = options?.rate ?? this.settings.rate;
      utterance.pitch = options?.pitch ?? this.settings.pitch;
      utterance.lang = 'ko-KR';

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      this.synth!.speak(utterance);
    });
  }

  public speakSlow(text: string): Promise<void> {
    return this.speak(text, { rate: 0.8 });
  }

  public async speakRepeat(text: string, times: number = 2): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.speak(text);
      if (i < times - 1) {
        // Small delay between repetitions
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  public cancel(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public pause(): void {
    if (this.synth) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.synth) {
      this.synth.resume();
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }

  public isPaused(): boolean {
    return this.synth ? this.synth.paused : false;
  }

  public updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }
}

// Singleton instance
let speechService: SpeechService | null = null;

export function getSpeechService(): SpeechService {
  if (typeof window === 'undefined') {
    throw new Error('SpeechService can only be used in browser environment');
  }
  
  if (!speechService) {
    speechService = new SpeechService();
  }
  
  return speechService;
}

// Hook for React components
export function useSpeechService() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return getSpeechService();
}
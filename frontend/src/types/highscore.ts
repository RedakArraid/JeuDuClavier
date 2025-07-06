import { DifficultyLevel } from './game';
import { Language } from '../i18n/translations';

export interface HighScore {
  id: string;
  playerName: string;
  email?: string;
  score: number;
  wpm: number;
  accuracy: number;
  wordsTyped: number;
  timeElapsed: number;
  date: string;
  difficulty: DifficultyLevel;
  language: Language;
}

export interface HighScoresByLevel {
  easy: HighScore[];
  normal: HighScore[];
  hard: HighScore[];
  expert: HighScore[];
}

export interface HighScoresByLanguage {
  fr: HighScoresByLevel;
  en: HighScoresByLevel;
}

export interface NewScoreModalProps {
  isOpen: boolean;
  score: number;
  difficulty: DifficultyLevel;
  language: Language;
  onSubmit: (playerName: string, email?: string) => void;
  onClose: () => void;
}

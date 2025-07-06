export interface GameStats {
  score: number;
  wpm: number;
  accuracy: number;
  level: number;
  wordsTyped: number;
  errorsCount: number;
  timeElapsed: number;
  currentSpeed: number;
}

export interface FallingWord {
  id: string;
  text: string;
  x: number;
  y: number;
  speed: number;
  typed: string;
  isComplete: boolean;
  isActive: boolean;
}

export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'expert';

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  difficulty: DifficultyLevel;
  stats: GameStats;
  fallingWords: FallingWord[];
  currentInput: string;
  activeWordId: string | null;
  gameStartTime: number;
}

export interface GameConfig {
  wordSpeed: number;
  spawnRate: number;
  maxWords: number;
  reverseWords: boolean;
}
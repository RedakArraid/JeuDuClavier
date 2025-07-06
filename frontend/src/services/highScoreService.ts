import { HighScore, HighScoresByLanguage } from '../types/highscore';
import { DifficultyLevel } from '../types/game';
import { Language } from '../i18n/translations';

const STORAGE_KEY = 'typing_game_highscores';
const MAX_SCORES_PER_LEVEL = 3; // Top 3 pour chaque niveau

// Structure par défaut
const defaultHighScores: HighScoresByLanguage = {
  fr: {
    easy: [],
    normal: [],
    hard: [],
    expert: []
  },
  en: {
    easy: [],
    normal: [],
    hard: [],
    expert: []
  }
};

export class HighScoreService {
  private static instance: HighScoreService;
  private highScores: HighScoresByLanguage;

  private constructor() {
    this.loadHighScores();
  }

  public static getInstance(): HighScoreService {
    if (!HighScoreService.instance) {
      HighScoreService.instance = new HighScoreService();
    }
    return HighScoreService.instance;
  }

  private loadHighScores(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.highScores = JSON.parse(stored);
        // Vérifier la structure et migrer si nécessaire
        this.ensureStructure();
      } else {
        this.highScores = defaultHighScores;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des scores:', error);
      this.highScores = defaultHighScores;
    }
  }

  private ensureStructure(): void {
    // S'assurer que la structure est complète
    if (!this.highScores.fr) this.highScores.fr = defaultHighScores.fr;
    if (!this.highScores.en) this.highScores.en = defaultHighScores.en;
    
    const levels: DifficultyLevel[] = ['easy', 'normal', 'hard', 'expert'];
    levels.forEach(level => {
      if (!this.highScores.fr[level]) this.highScores.fr[level] = [];
      if (!this.highScores.en[level]) this.highScores.en[level] = [];
    });
  }

  private saveHighScores(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.highScores));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des scores:', error);
    }
  }

  public getHighScores(language: Language, difficulty: DifficultyLevel): HighScore[] {
    return [...(this.highScores[language][difficulty] || [])];
  }

  public getAllHighScores(): HighScoresByLanguage {
    return JSON.parse(JSON.stringify(this.highScores));
  }

  public isNewHighScore(score: number, language: Language, difficulty: DifficultyLevel): boolean {
    const scores = this.highScores[language][difficulty];
    
    // Si moins de MAX_SCORES_PER_LEVEL scores, c'est automatiquement un high score
    if (scores.length < MAX_SCORES_PER_LEVEL) {
      return true;
    }
    
    // Vérifier si le score est meilleur que le plus bas score actuel
    const lowestScore = Math.min(...scores.map(s => s.score));
    return score > lowestScore;
  }

  public addHighScore(
    playerName: string,
    score: number,
    wpm: number,
    accuracy: number,
    wordsTyped: number,
    timeElapsed: number,
    difficulty: DifficultyLevel,
    language: Language,
    email?: string
  ): HighScore {
    const newScore: HighScore = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      playerName: playerName.trim(),
      email: email?.trim() || undefined,
      score,
      wpm,
      accuracy,
      wordsTyped,
      timeElapsed,
      date: new Date().toISOString(),
      difficulty,
      language
    };

    // Ajouter le nouveau score
    this.highScores[language][difficulty].push(newScore);
    
    // Trier par score décroissant
    this.highScores[language][difficulty].sort((a, b) => b.score - a.score);
    
    // Garder seulement les MAX_SCORES_PER_LEVEL meilleurs
    if (this.highScores[language][difficulty].length > MAX_SCORES_PER_LEVEL) {
      this.highScores[language][difficulty] = this.highScores[language][difficulty].slice(0, MAX_SCORES_PER_LEVEL);
    }

    this.saveHighScores();
    return newScore;
  }

  public clearHighScores(language?: Language, difficulty?: DifficultyLevel): void {
    if (language && difficulty) {
      // Effacer un niveau spécifique
      this.highScores[language][difficulty] = [];
    } else if (language) {
      // Effacer une langue
      this.highScores[language] = defaultHighScores[language];
    } else {
      // Effacer tout
      this.highScores = defaultHighScores;
    }
    this.saveHighScores();
  }

  public getPlayerRank(score: number, language: Language, difficulty: DifficultyLevel): number {
    const scores = this.highScores[language][difficulty];
    const betterScores = scores.filter(s => s.score > score).length;
    return betterScores + 1;
  }
}

export const highScoreService = HighScoreService.getInstance();

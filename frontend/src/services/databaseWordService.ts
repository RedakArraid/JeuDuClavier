// frontend/src/services/databaseWordService.ts
// 🎯 Service frontend pour récupérer les mots de la BDD

import { DifficultyLevel } from '../types/game';
import { Language } from '../i18n/translations';

interface WordResponse {
  success: boolean;
  word: string;
  length: number;
  difficulty: number;
  frequency: number;
  meta: {
    requestedDifficulty: string;
    language: string;
    level: number;
  };
}

interface BatchWordsResponse {
  success: boolean;
  words: Array<{
    text: string;
    length: number;
    difficulty: number;
  }>;
  count: number;
  meta: {
    requestedDifficulty: string;
    language: string;
    level: number;
  };
}

class DatabaseWordService {
  private baseUrl: string;
  private cache = new Map<string, { words: string[]; timestamp: number }>();
  private cacheTimeout = 30 * 1000; // 30 secondes seulement

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }

  // 🧹 Nettoyer les accents et caractères spéciaux
  private normalizeWord(word: string): string {
    return word
      .toUpperCase()
      .replace(/[À-ÿ]/g, (match) => {
        // Table de conversion des accents
        const accentMap: { [key: string]: string } = {
          'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A',
          'Æ': 'AE', 'Ç': 'C', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
          'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I', 'Ð': 'D', 'Ñ': 'N',
          'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O', 'Ø': 'O',
          'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U', 'Ý': 'Y', 'Þ': 'TH',
          'ß': 'SS', 'à': 'A', 'á': 'A', 'â': 'A', 'ã': 'A', 'ä': 'A',
          'å': 'A', 'æ': 'AE', 'ç': 'C', 'è': 'E', 'é': 'E', 'ê': 'E',
          'ë': 'E', 'ì': 'I', 'í': 'I', 'î': 'I', 'ï': 'I', 'ð': 'D',
          'ñ': 'N', 'ò': 'O', 'ó': 'O', 'ô': 'O', 'õ': 'O', 'ö': 'O',
          'ø': 'O', 'ù': 'U', 'ú': 'U', 'û': 'U', 'ü': 'U', 'ý': 'Y',
          'þ': 'TH', 'ÿ': 'Y'
        };
        return accentMap[match] || match;
      })
      .replace(/[^A-Z0-9]/g, ''); // Supprimer tout sauf lettres et chiffres
  }

  // 🎯 Récupérer un mot aléatoire
  async getRandomWord(
    difficulty: DifficultyLevel, 
    language: Language = 'fr', 
    level: number = 1
  ): Promise<string> {
    const cacheKey = `${difficulty}-${language}-${level}`;
    
    // Vérifier le cache (très court pour plus de variété)
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.cacheTimeout && cached.words.length > 0) {
        // Prendre un mot aléatoire du cache
        const randomIndex = Math.floor(Math.random() * cached.words.length);
        const word = cached.words[randomIndex];
        // Retirer le mot du cache pour éviter les répétitions
        cached.words.splice(randomIndex, 1);
        return this.normalizeWord(word);
      }
    }

    try {
      // Récupérer un batch de mots pour remplir le cache
      const response = await fetch(
        `${this.baseUrl}/game-words/batch?difficulty=${difficulty}&language=${language}&level=${level}&count=20`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: BatchWordsResponse = await response.json();

      if (!data.success || !data.words || data.words.length === 0) {
        throw new Error('Réponse API invalide');
      }

      // Mélanger les mots
      const shuffledWords = data.words
        .map(w => w.text)
        .sort(() => Math.random() - 0.5);

      // Mettre en cache
      this.cache.set(cacheKey, {
        words: shuffledWords,
        timestamp: Date.now()
      });

      // Retourner le premier mot normalisé
      const firstWord = shuffledWords[0];
      return this.normalizeWord(firstWord);

    } catch (error) {
      console.warn('Erreur API mots, fallback vers statique:', error);
      return this.getStaticFallback(difficulty, language);
    }
  }

  // 🔄 Récupérer plusieurs mots d'un coup
  async getBatchWords(
    difficulty: DifficultyLevel,
    language: Language = 'fr',
    level: number = 1,
    count: number = 10
  ): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/game-words/batch?difficulty=${difficulty}&language=${language}&level=${level}&count=${count}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: BatchWordsResponse = await response.json();

      if (!data.success || !data.words) {
        throw new Error('Réponse API invalide');
      }

      return data.words.map(w => this.normalizeWord(w.text));

    } catch (error) {
      console.warn('Erreur API batch, fallback vers statique:', error);
      // Retourner plusieurs mots statiques
      const words: string[] = [];
      for (let i = 0; i < count; i++) {
        words.push(this.getStaticFallback(difficulty, language));
      }
      return words;
    }
  }

  // 🔙 Mots statiques de secours
  private getStaticFallback(difficulty: DifficultyLevel, language: Language): string {
    const staticWords = {
      fr: {
        easy: ['CHAT', 'CHIEN', 'SOLEIL', 'JEU', 'AUTO', 'ROUGE'],
        normal: ['MAISON', 'JARDIN', 'MUSIQUE', 'DANSE', 'NATURE', 'FLEUR'],
        hard: ['TECHNOLOGIE', 'ORDINATEUR', 'PROGRAMMATION', 'ARCHITECTURE'],
        expert: ['IMPLEMENTATION', 'SYNCHRONISATION', 'CONFIGURATION', 'INTERNATIONAL']
      },
      en: {
        easy: ['CAT', 'DOG', 'SUN', 'GAME', 'CAR', 'RED'],
        normal: ['HOUSE', 'GARDEN', 'MUSIC', 'DANCE', 'NATURE', 'FLOWER'],
        hard: ['TECHNOLOGY', 'COMPUTER', 'PROGRAMMING', 'ARCHITECTURE'],
        expert: ['IMPLEMENTATION', 'SYNCHRONIZATION', 'CONFIGURATION', 'INTERNATIONAL']
      }
    };

    const words = staticWords[language]?.[difficulty] || staticWords.fr.normal;
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
  }

  // 🧹 Nettoyer le cache
  clearCache(): void {
    this.cache.clear();
  }

  // 🔍 Vérifier la connexion API
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/game-words/stats`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const databaseWordService = new DatabaseWordService();
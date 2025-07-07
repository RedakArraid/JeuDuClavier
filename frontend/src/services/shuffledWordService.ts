// frontend/src/services/shuffledWordService.ts
// 🎯 Service frontend pour liste mélangée - ZÉRO répétition

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

interface ListStatsResponse {
  success: boolean;
  stats: {
    totalWords: number;
    currentIndex: number;
    wordsRemaining: number;
    progress: number;
    nextWords: string[];
  };
  difficulty: string;
  language: string;
  level: number;
}

class ShuffledWordService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }

  // 🎯 Récupérer le prochain mot de la liste mélangée
  async getNextWord(
    difficulty: DifficultyLevel, 
    language: Language = 'fr', 
    level: number = 1
  ): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}/game-words/next?difficulty=${difficulty}&language=${language}&level=${level}`,
        {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: WordResponse = await response.json();

      if (!data.success || !data.word) {
        throw new Error('Réponse API invalide');
      }

      const word = data.word.toUpperCase();
      console.log(`📝 Prochain mot: "${word}" (${difficulty}, ${language}, niveau ${level})`);
      
      return word;

    } catch (error) {
      console.warn('❌ Erreur API, fallback vers statique:', error);
      return this.getStaticFallback(difficulty, language);
    }
  }

  // 🔄 Redémarrer une partie (re-mélanger la liste)
  async restartGame(
    difficulty: DifficultyLevel,
    language: Language = 'fr',
    level: number = 1
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/game-words/restart`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify({
            difficulty,
            language,
            level
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log(`🔄 Partie redémarrée: liste re-mélangée pour ${difficulty} ${language}`);
        return true;
      }
      
      return false;

    } catch (error) {
      console.warn('❌ Erreur redémarrage:', error);
      return false;
    }
  }

  // 📊 Récupérer les stats de la liste actuelle
  async getListStats(
    difficulty: DifficultyLevel,
    language: Language = 'fr',
    level: number = 1
  ): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/game-words/list-stats?difficulty=${difficulty}&language=${language}&level=${level}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ListStatsResponse = await response.json();

      if (data.success) {
        console.log(`📊 Stats liste: ${data.stats.currentIndex}/${data.stats.totalWords} (${data.stats.progress}%)`);
        return data.stats;
      }

      return null;

    } catch (error) {
      console.warn('❌ Erreur récupération stats:', error);
      return null;
    }
  }

  // 🔙 Mots statiques de secours (avec randomisation)
  private getStaticFallback(difficulty: DifficultyLevel, language: Language): string {
    const staticWords = {
      fr: {
        easy: [
          'CHAT', 'CHIEN', 'SOLEIL', 'JEU', 'AUTO', 'ROUGE', 'BLEU', 'VERT', 
          'LUNE', 'STAR', 'COOL', 'SUPER', 'TOP', 'WIN', 'YES', 'OUI', 'NON',
          'VIE', 'AMOUR', 'PAIX', 'JOIE', 'RIRE', 'DOUX', 'BEAU', 'BIEN'
        ],
        normal: [
          'MAISON', 'JARDIN', 'MUSIQUE', 'DANSE', 'NATURE', 'FLEUR', 'OCEAN',
          'MONTAGNE', 'FORET', 'RIVIERE', 'SOLEIL', 'PLUIE', 'NEIGE', 'VENT',
          'NUAGE', 'ETOILE', 'PLANETE', 'VOYAGE', 'AVENTURE', 'REVE', 'ESPOIR'
        ],
        hard: [
          'TECHNOLOGIE', 'ORDINATEUR', 'PROGRAMMATION', 'ARCHITECTURE',
          'DEVELOPPEMENT', 'ALGORITHME', 'DATABASE', 'INTERFACE', 'SYSTEME',
          'OPTIMISATION', 'PERFORMANCE', 'SECURITE', 'INNOVATION', 'CREATION'
        ],
        expert: [
          'IMPLEMENTATION', 'SYNCHRONISATION', 'CONFIGURATION', 'INTERNATIONAL',
          'TRANSFORMATION', 'COLLABORATION', 'INFRASTRUCTURE', 'SPECIFICATION',
          'DOCUMENTATION', 'AUTHENTICATION', 'AUTHORIZATION', 'VIRTUALIZATION'
        ]
      },
      en: {
        easy: [
          'CAT', 'DOG', 'SUN', 'GAME', 'CAR', 'RED', 'BLUE', 'GREEN',
          'MOON', 'STAR', 'COOL', 'SUPER', 'TOP', 'WIN', 'YES', 'LIFE',
          'LOVE', 'PEACE', 'JOY', 'LAUGH', 'SOFT', 'NICE', 'GOOD'
        ],
        normal: [
          'HOUSE', 'GARDEN', 'MUSIC', 'DANCE', 'NATURE', 'FLOWER', 'OCEAN',
          'MOUNTAIN', 'FOREST', 'RIVER', 'SUNSHINE', 'RAIN', 'SNOW', 'WIND',
          'CLOUD', 'STAR', 'PLANET', 'TRAVEL', 'ADVENTURE', 'DREAM', 'HOPE'
        ],
        hard: [
          'TECHNOLOGY', 'COMPUTER', 'PROGRAMMING', 'ARCHITECTURE',
          'DEVELOPMENT', 'ALGORITHM', 'DATABASE', 'INTERFACE', 'SYSTEM',
          'OPTIMIZATION', 'PERFORMANCE', 'SECURITY', 'INNOVATION', 'CREATION'
        ],
        expert: [
          'IMPLEMENTATION', 'SYNCHRONIZATION', 'CONFIGURATION', 'INTERNATIONAL',
          'TRANSFORMATION', 'COLLABORATION', 'INFRASTRUCTURE', 'SPECIFICATION',
          'DOCUMENTATION', 'AUTHENTICATION', 'AUTHORIZATION', 'VIRTUALIZATION'
        ]
      }
    };

    const words = staticWords[language]?.[difficulty] || staticWords.fr.normal;
    
    // Randomisation pour éviter les patterns
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const randomIndex = Math.floor(Math.random() * shuffled.length);
    
    const selectedWord = shuffled[randomIndex];
    console.log(`🔙 Fallback statique: "${selectedWord}" (${difficulty}, ${language})`);
    
    return selectedWord;
  }

  // 🔍 Test de connexion
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/game-words/list-stats?difficulty=normal&language=fr&level=1`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // 🎮 Initialiser une nouvelle partie
  async initializeGame(
    difficulty: DifficultyLevel,
    language: Language = 'fr',
    level: number = 1
  ): Promise<void> {
    console.log(`🎮 Initialisation nouvelle partie: ${difficulty} ${language} niveau ${level}`);
    
    // Démarrer/redémarrer la partie pour mélanger la liste
    await this.restartGame(difficulty, language, level);
    
    // Récupérer les stats pour info
    const stats = await this.getListStats(difficulty, language, level);
    if (stats) {
      console.log(`📊 Liste initialisée: ${stats.totalWords} mots disponibles`);
      console.log(`🎯 Prochains mots: ${stats.nextWords.join(', ')}`);
    }
  }

  // 📈 Monitoring des performances
  async getPerformanceInfo(
    difficulty: DifficultyLevel,
    language: Language = 'fr',
    level: number = 1
  ): Promise<any> {
    const stats = await this.getListStats(difficulty, language, level);
    const connected = await this.testConnection();
    
    return {
      connected,
      listStats: stats,
      cacheKey: `${difficulty}-${language}-${Math.floor(level / 3) * 3}`,
      system: 'Shuffled List (Zero Repetition)'
    };
  }
}

export const shuffledWordService = new ShuffledWordService();
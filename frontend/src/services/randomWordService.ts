// frontend/src/services/randomWordService.ts
// 🎲 Service pour récupérer des mots VRAIMENT aléatoires (sans cache)

import { DifficultyLevel } from '../types/game';
import { Language } from '../i18n/translations';

interface WordResponse {
  success: boolean;
  word: string;
  length: number;
  difficulty: number;
  frequency: number;
}

class RandomWordService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }

  // 🎲 Récupérer un mot VRAIMENT aléatoire (sans cache)
  async getRandomWord(
    difficulty: DifficultyLevel, 
    language: Language = 'fr', 
    level: number = 1
  ): Promise<string> {
    try {
      // Ajouter timestamp pour éviter tout cache
      const timestamp = Date.now() + Math.random();
      const response = await fetch(
        `${this.baseUrl}/game-words/random?difficulty=${difficulty}&language=${language}&level=${level}&_t=${timestamp}`,
        {
          // Désactiver complètement le cache du navigateur
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
      console.log(`🎲 Nouveau mot aléatoire: "${word}" (${difficulty}, ${language}, niveau ${level})`);
      
      return word;

    } catch (error) {
      console.warn('❌ Erreur API, fallback vers statique:', error);
      return this.getStaticFallback(difficulty, language);
    }
  }

  // 🔄 Récupérer plusieurs mots aléatoires
  async getMultipleRandomWords(
    difficulty: DifficultyLevel,
    language: Language = 'fr',
    level: number = 1,
    count: number = 5
  ): Promise<string[]> {
    const words: string[] = [];
    
    // Récupérer chaque mot individuellement pour maximiser la variété
    for (let i = 0; i < count; i++) {
      try {
        const word = await this.getRandomWord(difficulty, language, level);
        words.push(word);
        
        // Petite pause pour éviter les doublons
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.warn(`Erreur mot ${i + 1}:`, error);
      }
    }
    
    console.log(`🎲 ${words.length} mots aléatoires récupérés:`, words);
    return words;
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
          'DEVELOPPEMENT', 'ALGORITHM', 'DATABASE', 'INTERFACE', 'SYSTEME',
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
    
    // Randomisation multiple pour éviter les patterns
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const randomIndex = Math.floor(Math.random() * shuffled.length);
    
    const selectedWord = shuffled[randomIndex];
    console.log(`🔙 Fallback statique: "${selectedWord}" (${difficulty}, ${language})`);
    
    return selectedWord;
  }

  // 🔍 Test de connexion
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/game-words/stats?_t=${Date.now()}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // 📊 Statistiques (pour debug)
  async getStats(difficulty: DifficultyLevel = 'normal', language: Language = 'fr') {
    try {
      const response = await fetch(
        `${this.baseUrl}/game-words/stats?difficulty=${difficulty}&language=${language}&_t=${Date.now()}`
      );
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Erreur récupération stats:', error);
    }
    
    return null;
  }
}

export const randomWordService = new RandomWordService();
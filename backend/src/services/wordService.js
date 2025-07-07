// backend/src/services/wordService.js
// 🎯 Service intelligent pour récupérer des mots depuis la BDD

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class WordService {
  constructor() {
    this.cache = new Map(); // Cache en mémoire pour performance
    this.cacheTimeout = 1 * 60 * 1000; // 1 minute seulement
  }

  // 🎯 Récupérer un mot aléatoire intelligent selon la difficulté
  async getRandomWord(difficulty, language = 'fr', level = 1) {
    const cacheKey = `${difficulty}-${language}-${level}`;
    
    // Vérifier le cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        const randomIndex = Math.floor(Math.random() * cached.words.length);
        return cached.words[randomIndex];
      }
    }

    try {
      // Configuration intelligente par difficulté
      const config = this.getDifficultyConfig(difficulty, level);
      
      // Requête optimisée avec randomisation
      const words = await prisma.word.findMany({
        where: {
          language: language,
          length: {
            gte: config.minLength,
            lte: config.maxLength
          },
          difficulty: {
            in: config.allowedDifficulties
          },
          // Favoriser les mots fréquents mais pas trop
          frequency: {
            gte: config.minFrequency
          }
        },
        select: {
          text: true,
          length: true,
          difficulty: true,
          frequency: true
        },
        // Randomisation au niveau de la base
        orderBy: {
          text: 'asc' // Tri alphabétique pour plus de variété
        },
        // Prendre un offset aléatoire pour la randomisation
        skip: Math.floor(Math.random() * 1000),
        take: config.poolSize
      });

      if (words.length === 0) {
        // Fallback vers des critères plus larges
        return await this.getFallbackWord(difficulty, language);
      }

      // Mettre en cache
      this.cache.set(cacheKey, {
        words: words,
        timestamp: Date.now()
      });

      // Retourner un mot aléatoire du pool
      const randomIndex = Math.floor(Math.random() * words.length);
      return words[randomIndex];

    } catch (error) {
      console.error('Erreur récupération mot:', error);
      // Fallback vers les mots statiques
      return this.getStaticFallback(difficulty, language);
    }
  }

  // 📊 Configuration intelligente par difficulté
  getDifficultyConfig(difficulty, level = 1) {
    const baseConfigs = {
      easy: {
        minLength: 2,
        maxLength: 4,
        allowedDifficulties: [1],
        minFrequency: 1, // Réduire pour plus de variété
        poolSize: 500    // Augmenter le pool
      },
      normal: {
        minLength: 3,
        maxLength: 6,
        allowedDifficulties: [1, 2],
        minFrequency: 1, // Réduire pour plus de variété
        poolSize: 750    // Augmenter le pool
      },
      hard: {
        minLength: 4,
        maxLength: 8,
        allowedDifficulties: [2, 3],
        minFrequency: 1,
        poolSize: 1000   // Augmenter le pool
      },
      expert: {
        minLength: 3,
        maxLength: 10,
        allowedDifficulties: [1, 2, 3, 4],
        minFrequency: 1,
        poolSize: 1500   // Augmenter le pool
      }
    };

    const config = baseConfigs[difficulty] || baseConfigs.normal;
    
    // Progression avec le niveau
    if (level > 3) {
      config.maxLength += Math.floor(level / 4);
      config.allowedDifficulties.push(Math.min(4, Math.max(...config.allowedDifficulties) + 1));
    }

    return config;
  }

  // 🆘 Mot de secours si la requête principale échoue
  async getFallbackWord(difficulty, language) {
    try {
      const fallbackWords = await prisma.word.findMany({
        where: {
          language: language,
          length: { gte: 3, lte: 8 }
        },
        select: { text: true },
        take: 50,
        orderBy: { frequency: 'desc' }
      });

      if (fallbackWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * fallbackWords.length);
        return fallbackWords[randomIndex];
      }

    } catch (error) {
      console.error('Erreur fallback:', error);
    }

    return this.getStaticFallback(difficulty, language);
  }

  // 🔙 Mots statiques de secours ultime
  getStaticFallback(difficulty, language) {
    const staticWords = {
      fr: {
        easy: ['CHAT', 'CHIEN', 'SOLEIL', 'JEU'],
        normal: ['MAISON', 'JARDIN', 'MUSIQUE', 'DANSE'],
        hard: ['TECHNOLOGIE', 'PROGRAMMATION', 'ORDINATEUR'],
        expert: ['IMPLEMENTATION', 'SYNCHRONISATION', 'ARCHITECTURE']
      },
      en: {
        easy: ['CAT', 'DOG', 'SUN', 'GAME'],
        normal: ['HOUSE', 'GARDEN', 'MUSIC', 'DANCE'],
        hard: ['TECHNOLOGY', 'PROGRAMMING', 'COMPUTER'],
        expert: ['IMPLEMENTATION', 'SYNCHRONIZATION', 'ARCHITECTURE']
      }
    };

    const words = staticWords[language]?.[difficulty] || staticWords.fr.normal;
    const randomIndex = Math.floor(Math.random() * words.length);
    
    return {
      text: words[randomIndex],
      length: words[randomIndex].length,
      difficulty: 1,
      frequency: 5
    };
  }

  // 📈 Statistiques pour optimisation
  async getWordStats(difficulty, language) {
    try {
      const stats = await prisma.word.groupBy({
        by: ['length', 'difficulty'],
        where: {
          language: language
        },
        _count: {
          text: true
        },
        orderBy: [
          { length: 'asc' },
          { difficulty: 'asc' }
        ]
      });

      return stats;
    } catch (error) {
      console.error('Erreur stats:', error);
      return [];
    }
  }

  // 🧹 Nettoyer le cache périodiquement
  clearCache() {
    this.cache.clear();
  }
}

export default new WordService();
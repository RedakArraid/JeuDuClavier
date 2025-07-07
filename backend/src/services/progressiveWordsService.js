// backend/src/services/progressiveWordsService.js
// 🎯 Service de mots avec progression intelligente selon vos règles exactes

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class ProgressiveWordsService {
  constructor() {
    this.cache = new Map();
    
    // 🎯 Configuration selon vos règles exactes
    this.DIFFICULTY_RULES = {
      easy: {
        name: 'Facile',
        baseLengths: [2, 3, 4],        // 2-4 lettres de base
        progressiveLengths: [5],        // + 5 lettres à partir niveau 4
        unlockLevel: 4,
        description: 'Mots de 2-4 lettres, +5 lettres niveau 4+'
      },
      normal: {
        name: 'Normal', 
        baseLengths: [3, 4, 5, 6],      // 3-6 lettres de base
        progressiveLengths: [7],        // + 7 lettres à partir niveau 4
        unlockLevel: 4,
        description: 'Mots de 3-6 lettres, +7 lettres niveau 4+'
      },
      hard: {
        name: 'Difficile',
        baseLengths: [4, 5, 6, 7],      // 4-7 lettres de base
        progressiveLengths: [8],        // + 8 lettres à partir niveau 4
        unlockLevel: 4,
        description: 'Mots de 4-7 lettres, +8 lettres niveau 4+'
      },
      expert: {
        name: 'Expert',
        baseLengths: [3, 4, 5],         // 3-5 lettres de base
        progressiveLengths: [6, 7, 8],  // + 6,7,8 lettres à partir niveau 4
        unlockLevel: 4,
        description: 'Mots de 3-5 lettres, +6,7,8 lettres niveau 4+'
      }
    };
  }

  // 🎮 Récupérer des mots selon difficulté, niveau et langue
  async getWordsForGame(difficulty, level, language, count = 1) {
    const rules = this.DIFFICULTY_RULES[difficulty];
    if (!rules) {
      throw new Error(`Difficulté "${difficulty}" non supportée`);
    }

    // Déterminer les longueurs disponibles
    let availableLengths = [...rules.baseLengths];
    
    if (level >= rules.unlockLevel) {
      availableLengths.push(...rules.progressiveLengths);
      console.log(`🔓 Niveau ${level}: Déblocage des mots de ${rules.progressiveLengths.join(', ')} lettres`);
    }

    // Clé de cache
    const cacheKey = `${difficulty}_${level}_${language}_${availableLengths.join('-')}`;
    
    // Essayer le cache d'abord
    if (this.cache.has(cacheKey)) {
      const cachedWords = this.cache.get(cacheKey);
      return this.selectRandomWords(cachedWords, count);
    }

    // Récupérer depuis la base
    try {
      const words = await prisma.word.findMany({
        where: {
          language: language.toLowerCase(),
          length: { in: availableLengths },
          gameType: { slug: 'typing' }
        },
        select: {
          text: true,
          length: true,
          frequency: true,
          difficulty: true,
          category: true
        },
        orderBy: [
          { frequency: 'desc' }, // Privilégier mots fréquents
          { length: 'asc' }      // Puis mots courts
        ],
        take: 1000 // Limiter pour performance cache
      });

      if (words.length === 0) {
        console.warn(`⚠️ Aucun mot trouvé pour ${difficulty} niveau ${level} en ${language}`);
        return await this.getFallbackWords(language, count);
      }

      // Mettre en cache
      this.cache.set(cacheKey, words);
      
      console.log(`📦 ${words.length} mots disponibles pour ${difficulty} niveau ${level} (${availableLengths.join(', ')} lettres)`);
      
      return this.selectRandomWords(words, count);

    } catch (error) {
      console.error('❌ Erreur récupération mots:', error);
      return await this.getFallbackWords(language, count);
    }
  }

  // 🎲 Sélectionner des mots aléatoirement avec pondération
  selectRandomWords(wordPool, count) {
    if (wordPool.length === 0) return [];
    
    const selected = [];
    const usedWords = new Set();

    for (let i = 0; i < count && selected.length < wordPool.length; i++) {
      let attempts = 0;
      let word;
      
      do {
        // Pondération: mots fréquents ont plus de chances
        const randomIndex = this.getWeightedRandomIndex(wordPool);
        word = wordPool[randomIndex];
        attempts++;
      } while (usedWords.has(word.text) && attempts < 10);
      
      if (!usedWords.has(word.text)) {
        selected.push(word);
        usedWords.add(word.text);
      }
    }

    return selected;
  }

  // ⚖️ Index aléatoire pondéré par fréquence
  getWeightedRandomIndex(words) {
    const maxIndex = words.length;
    const random = Math.random();
    
    // Distribution pondérée: favorise les premiers 30%
    if (random < 0.7) {
      return Math.floor(Math.random() * Math.min(maxIndex * 0.3, maxIndex));
    } else {
      return Math.floor(Math.random() * maxIndex);
    }
  }

  // 🆘 Mots de secours si aucun trouvé
  async getFallbackWords(language, count) {
    console.log('🆘 Utilisation des mots de secours...');
    
    try {
      const fallbackWords = await prisma.word.findMany({
        where: {
          language: language.toLowerCase(),
          length: { gte: 3, lte: 6 },
          gameType: { slug: 'typing' }
        },
        take: count * 2,
        orderBy: { frequency: 'desc' }
      });

      return fallbackWords.slice(0, count);
    } catch (error) {
      console.error('❌ Erreur mots de secours:', error);
      return [];
    }
  }

  // 📊 Obtenir les statistiques de distribution
  async getDistributionStats(difficulty, language) {
    const rules = this.DIFFICULTY_RULES[difficulty];
    if (!rules) return null;

    try {
      // Compter mots de base
      const baseWordsCount = await prisma.word.count({
        where: {
          language: language.toLowerCase(),
          length: { in: rules.baseLengths },
          gameType: { slug: 'typing' }
        }
      });

      // Compter mots progressifs
      const progressiveWordsCount = await prisma.word.count({
        where: {
          language: language.toLowerCase(),
          length: { in: rules.progressiveLengths },
          gameType: { slug: 'typing' }
        }
      });

      // Distribution détaillée par longueur
      const distribution = {};
      const allLengths = [...rules.baseLengths, ...rules.progressiveLengths];
      
      for (const length of allLengths) {
        distribution[length] = await prisma.word.count({
          where: {
            language: language.toLowerCase(),
            length: length,
            gameType: { slug: 'typing' }
          }
        });
      }

      return {
        difficulty: rules.name,
        baseWordsCount,
        progressiveWordsCount,
        totalWords: baseWordsCount + progressiveWordsCount,
        unlockLevel: rules.unlockLevel,
        distribution,
        baseLengths: rules.baseLengths,
        progressiveLengths: rules.progressiveLengths,
        description: rules.description,
        isReady: baseWordsCount > 50
      };

    } catch (error) {
      console.error('❌ Erreur stats distribution:', error);
      return null;
    }
  }

  // 🧹 Nettoyer le cache
  clearCache() {
    this.cache.clear();
    console.log('🧹 Cache des mots nettoyé');
  }

  // 📊 Statistiques du cache
  getCacheInfo() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      totalCachedWords: Array.from(this.cache.values()).reduce((sum, words) => sum + words.length, 0)
    };
  }
}

export { ProgressiveWordsService };
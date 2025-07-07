// backend/src/services/shuffledWordService.js
// 🎲 Service avec liste pré-mélangée - ZÉRO répétition garantie

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class ShuffledWordService {
  constructor() {
    // Cache des listes mélangées par configuration
    this.shuffledLists = new Map();
    // Index actuel pour chaque liste
    this.currentIndexes = new Map();
  }

  // 🎯 Récupérer le prochain mot de la liste mélangée
  async getNextWord(difficulty, language = 'fr', level = 1) {
    const config = this.getDifficultyConfig(difficulty, level);
    const cacheKey = this.getCacheKey(difficulty, language, level);
    
    try {
      // Vérifier si on a une liste pour cette configuration
      if (!this.shuffledLists.has(cacheKey)) {
        console.log(`🔄 Création nouvelle liste mélangée pour ${cacheKey}`);
        await this.createShuffledList(difficulty, language, level);
      }
      
      const wordList = this.shuffledLists.get(cacheKey);
      let currentIndex = this.currentIndexes.get(cacheKey) || 0;
      
      // Si on est arrivé au bout de la liste, re-mélanger
      if (currentIndex >= wordList.length) {
        console.log(`🔄 Fin de liste atteinte pour ${cacheKey}, re-mélange...`);
        await this.reshuffleList(cacheKey);
        currentIndex = 0;
      }
      
      // Récupérer le mot à l'index actuel
      const selectedWord = wordList[currentIndex];
      
      // Incrémenter l'index pour le prochain appel
      this.currentIndexes.set(cacheKey, currentIndex + 1);
      
      console.log(`📝 Mot ${currentIndex + 1}/${wordList.length}: "${selectedWord.text}" (${cacheKey})`);
      
      return selectedWord;

    } catch (error) {
      console.error('❌ Erreur récupération mot séquentiel:', error);
      return this.getStaticFallback(difficulty, language);
    }
  }

  // 🎲 Créer une nouvelle liste mélangée
  async createShuffledList(difficulty, language, level) {
    const config = this.getDifficultyConfig(difficulty, level);
    const cacheKey = this.getCacheKey(difficulty, language, level);
    
    try {
      // Récupérer TOUS les mots correspondant aux critères
      const allWords = await prisma.word.findMany({
        where: {
          language: language,
          length: {
            gte: config.minLength,
            lte: config.maxLength
          },
          difficulty: {
            in: config.allowedDifficulties
          },
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
        orderBy: {
          frequency: 'desc' // Favoriser les mots fréquents en premier
        }
      });

      if (allWords.length === 0) {
        throw new Error(`Aucun mot trouvé pour ${cacheKey}`);
      }

      // MÉLANGER la liste avec l'algorithme Fisher-Yates
      const shuffledWords = this.fisherYatesShuffle([...allWords]);
      
      // Stocker la liste mélangée
      this.shuffledLists.set(cacheKey, shuffledWords);
      this.currentIndexes.set(cacheKey, 0);
      
      console.log(`✅ Liste créée et mélangée: ${shuffledWords.length} mots pour ${cacheKey}`);
      console.log(`📊 Exemples: ${shuffledWords.slice(0, 5).map(w => w.text).join(', ')}...`);
      
      return shuffledWords;

    } catch (error) {
      console.error(`❌ Erreur création liste pour ${cacheKey}:`, error);
      // Fallback vers une liste statique mélangée
      const staticWords = this.getStaticWordList(difficulty, language);
      const shuffledStatic = this.fisherYatesShuffle(staticWords);
      this.shuffledLists.set(cacheKey, shuffledStatic);
      this.currentIndexes.set(cacheKey, 0);
      return shuffledStatic;
    }
  }

  // 🔄 Re-mélanger une liste existante
  async reshuffleList(cacheKey) {
    if (!this.shuffledLists.has(cacheKey)) {
      throw new Error(`Liste ${cacheKey} non trouvée pour re-mélange`);
    }
    
    const currentList = this.shuffledLists.get(cacheKey);
    const reshuffledList = this.fisherYatesShuffle([...currentList]);
    
    this.shuffledLists.set(cacheKey, reshuffledList);
    this.currentIndexes.set(cacheKey, 0);
    
    console.log(`🔄 Liste re-mélangée: ${reshuffledList.length} mots pour ${cacheKey}`);
    console.log(`📊 Nouveaux exemples: ${reshuffledList.slice(0, 5).map(w => w.text).join(', ')}...`);
  }

  // 🎲 Algorithme de mélange Fisher-Yates (optimal)
  fisherYatesShuffle(array) {
    const shuffled = [...array];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }

  // 🔑 Générer une clé de cache unique
  getCacheKey(difficulty, language, level) {
    // Grouper par tranches de niveau pour éviter trop de listes
    const levelGroup = Math.floor(level / 3) * 3; // 0, 3, 6, 9, 12...
    return `${difficulty}-${language}-${levelGroup}`;
  }

  // 📊 Configuration par difficulté
  getDifficultyConfig(difficulty, level = 1) {
    const baseConfigs = {
      easy: {
        minLength: 2,
        maxLength: 4,
        allowedDifficulties: [1],
        minFrequency: 2,
      },
      normal: {
        minLength: 3,
        maxLength: 6,
        allowedDifficulties: [1, 2],
        minFrequency: 1,
      },
      hard: {
        minLength: 4,
        maxLength: 8,
        allowedDifficulties: [2, 3],
        minFrequency: 1,
      },
      expert: {
        minLength: 5,
        maxLength: 12,
        allowedDifficulties: [2, 3, 4],
        minFrequency: 1,
      }
    };

    const config = { ...baseConfigs[difficulty] } || { ...baseConfigs.normal };
    
    // Progression avec le niveau
    if (level > 3) {
      if (difficulty === 'expert') {
        config.minLength += Math.floor(level / 6);
        config.maxLength += Math.floor(level / 3);
      } else {
        config.maxLength += Math.floor(level / 4);
      }
      
      const maxDiffInConfig = Math.max(...config.allowedDifficulties);
      if (maxDiffInConfig < 4 && level > 5) {
        config.allowedDifficulties.push(Math.min(4, maxDiffInConfig + 1));
      }
    }

    return config;
  }

  // 🔄 Redémarrer une partie (re-mélanger la liste)
  async restartGame(difficulty, language = 'fr', level = 1) {
    const cacheKey = this.getCacheKey(difficulty, language, level);
    
    if (this.shuffledLists.has(cacheKey)) {
      console.log(`🎮 Redémarrage partie: re-mélange pour ${cacheKey}`);
      await this.reshuffleList(cacheKey);
    } else {
      console.log(`🎮 Nouvelle partie: création liste pour ${cacheKey}`);
      await this.createShuffledList(difficulty, language, level);
    }
  }

  // 📊 Statistiques d'une liste
  getListStats(difficulty, language = 'fr', level = 1) {
    const cacheKey = this.getCacheKey(difficulty, language, level);
    
    if (!this.shuffledLists.has(cacheKey)) {
      return { error: 'Liste non créée' };
    }
    
    const wordList = this.shuffledLists.get(cacheKey);
    const currentIndex = this.currentIndexes.get(cacheKey) || 0;
    
    return {
      totalWords: wordList.length,
      currentIndex: currentIndex,
      wordsRemaining: wordList.length - currentIndex,
      progress: Math.round((currentIndex / wordList.length) * 100),
      nextWords: wordList.slice(currentIndex, currentIndex + 5).map(w => w.text)
    };
  }

  // 🔙 Mots statiques de secours
  getStaticWordList(difficulty, language) {
    const staticWords = {
      fr: {
        easy: ['CHAT', 'CHIEN', 'SOLEIL', 'JEU', 'AUTO', 'ROUGE', 'BLEU', 'VERT'],
        normal: ['MAISON', 'JARDIN', 'MUSIQUE', 'DANSE', 'NATURE', 'FLEUR', 'OCEAN'],
        hard: ['TECHNOLOGIE', 'PROGRAMMATION', 'ORDINATEUR', 'SYSTEME', 'DATABASE'],
        expert: ['IMPLEMENTATION', 'SYNCHRONISATION', 'ARCHITECTURE', 'CONFIGURATION', 'INTERNATIONAL']
      },
      en: {
        easy: ['CAT', 'DOG', 'SUN', 'GAME', 'CAR', 'RED', 'BLUE', 'GREEN'],
        normal: ['HOUSE', 'GARDEN', 'MUSIC', 'DANCE', 'NATURE', 'FLOWER', 'OCEAN'],
        hard: ['TECHNOLOGY', 'PROGRAMMING', 'COMPUTER', 'SYSTEM', 'DATABASE'],
        expert: ['IMPLEMENTATION', 'SYNCHRONIZATION', 'ARCHITECTURE', 'CONFIGURATION', 'INTERNATIONAL']
      }
    };

    const words = staticWords[language]?.[difficulty] || staticWords.fr.normal;
    
    return words.map(text => ({
      text,
      length: text.length,
      difficulty: 1,
      frequency: 5
    }));
  }

  getStaticFallback(difficulty, language) {
    const words = this.getStaticWordList(difficulty, language);
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
  }

  // 🧹 Nettoyer le cache
  clearCache() {
    this.shuffledLists.clear();
    this.currentIndexes.clear();
    console.log('🧹 Cache des listes mélangées nettoyé');
  }

  // 📊 Stats globales du cache
  getCacheStats() {
    const stats = {};
    
    for (const [key, list] of this.shuffledLists.entries()) {
      const currentIndex = this.currentIndexes.get(key) || 0;
      stats[key] = {
        totalWords: list.length,
        currentIndex,
        progress: Math.round((currentIndex / list.length) * 100)
      };
    }
    
    return {
      totalLists: this.shuffledLists.size,
      lists: stats
    };
  }
}

export default new ShuffledWordService();
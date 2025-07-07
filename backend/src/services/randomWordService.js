// backend/src/services/randomWordService.js
// 🎲 Service backend pour récupérer des mots VRAIMENT aléatoires

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class RandomWordService {
  
  // 🎲 Récupérer un mot VRAIMENT aléatoire avec OFFSET aléatoire
  async getRandomWord(difficulty, language = 'fr', level = 1) {
    try {
      // Configuration par difficulté
      const config = this.getDifficultyConfig(difficulty, level);
      
      // 1. D'abord compter combien de mots correspondent aux critères
      const totalCount = await prisma.word.count({
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
        }
      });

      if (totalCount === 0) {
        return await this.getFallbackWord(difficulty, language);
      }

      // 2. Générer un OFFSET complètement aléatoire
      const randomOffset = Math.floor(Math.random() * totalCount);
      
      // 3. Récupérer UN SEUL mot à cette position aléatoire
      const randomWords = await prisma.word.findMany({
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
        skip: randomOffset,  // 🎲 OFFSET ALÉATOIRE
        take: 1              // 🎯 UN SEUL MOT
      });

      if (randomWords.length > 0) {
        const selectedWord = randomWords[0];
        console.log(`🎲 Mot aléatoire: "${selectedWord.text}" (offset: ${randomOffset}/${totalCount})`);
        return selectedWord;
      }

      return await this.getFallbackWord(difficulty, language);

    } catch (error) {
      console.error('❌ Erreur récupération mot aléatoire:', error);
      return this.getStaticFallback(difficulty, language);
    }
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
        minLength: 5,        // ✅ CORRIGÉ: 5+ lettres pour Expert
        maxLength: 12,       // ✅ ÉTENDU: jusqu'à 12 lettres
        allowedDifficulties: [2, 3, 4],  // ✅ PLUS DIFFICILE: niveaux 2-4
        minFrequency: 1,
      }
    };

    const config = baseConfigs[difficulty] || baseConfigs.normal;
    
    // Progression avec le niveau - améliorée
    if (level > 3) {
      // Pour Expert: progression plus agressive
      if (difficulty === 'expert') {
        config.minLength += Math.floor(level / 6);  // Augmente le minimum plus lentement
        config.maxLength += Math.floor(level / 3);  // Mots très longs aux hauts niveaux
      } else {
        config.maxLength += Math.floor(level / 4);
      }
      
      // Ajouter des difficultés progressivement
      const maxDiffInConfig = Math.max(...config.allowedDifficulties);
      if (maxDiffInConfig < 4 && level > 5) {
        config.allowedDifficulties.push(Math.min(4, maxDiffInConfig + 1));
      }
    }

    return config;
  }

  // 🆘 Mot de secours
  async getFallbackWord(difficulty, language) {
    try {
      // Critères plus larges avec offset aléatoire
      const fallbackCount = await prisma.word.count({
        where: {
          language: language,
          length: { gte: 3, lte: 8 }
        }
      });

      if (fallbackCount > 0) {
        const randomOffset = Math.floor(Math.random() * fallbackCount);
        
        const fallbackWords = await prisma.word.findMany({
          where: {
            language: language,
            length: { gte: 3, lte: 8 }
          },
          select: { 
            text: true, 
            length: true, 
            difficulty: true, 
            frequency: true 
          },
          skip: randomOffset,
          take: 1
        });

        if (fallbackWords.length > 0) {
          console.log(`🆘 Fallback: "${fallbackWords[0].text}"`);
          return fallbackWords[0];
        }
      }

    } catch (error) {
      console.error('❌ Erreur fallback:', error);
    }

    return this.getStaticFallback(difficulty, language);
  }

  // 🔙 Mots statiques de secours ultime
  getStaticFallback(difficulty, language) {
    const staticWords = {
      fr: {
        easy: ['CHAT', 'CHIEN', 'SOLEIL', 'JEU', 'AUTO', 'ROUGE', 'BLEU', 'VERT'],
        normal: ['MAISON', 'JARDIN', 'MUSIQUE', 'DANSE', 'NATURE', 'FLEUR', 'OCEAN'],
        hard: ['TECHNOLOGIE', 'PROGRAMMATION', 'ORDINATEUR', 'SYSTEME', 'DATABASE'],
        expert: ['IMPLEMENTATION', 'SYNCHRONISATION', 'ARCHITECTURE', 'CONFIGURATION']
      },
      en: {
        easy: ['CAT', 'DOG', 'SUN', 'GAME', 'CAR', 'RED', 'BLUE', 'GREEN'],
        normal: ['HOUSE', 'GARDEN', 'MUSIC', 'DANCE', 'NATURE', 'FLOWER', 'OCEAN'],
        hard: ['TECHNOLOGY', 'PROGRAMMING', 'COMPUTER', 'SYSTEM', 'DATABASE'],
        expert: ['IMPLEMENTATION', 'SYNCHRONIZATION', 'ARCHITECTURE', 'CONFIGURATION']
      }
    };

    const words = staticWords[language]?.[difficulty] || staticWords.fr.normal;
    
    // Triple randomisation pour éviter les patterns
    const shuffled = [...words]
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5)
      .sort(() => Math.random() - 0.5);
    
    const randomIndex = Math.floor(Math.random() * shuffled.length);
    const selectedWord = shuffled[randomIndex];
    
    console.log(`🔙 Static fallback: "${selectedWord}"`);
    
    return {
      text: selectedWord,
      length: selectedWord.length,
      difficulty: 1,
      frequency: 5
    };
  }

  // 📈 Statistiques pour vérification
  async getWordStats(difficulty, language) {
    try {
      const config = this.getDifficultyConfig(difficulty);
      
      const stats = await prisma.word.aggregate({
        where: {
          language: language,
          length: {
            gte: config.minLength,
            lte: config.maxLength
          },
          difficulty: {
            in: config.allowedDifficulties
          }
        },
        _count: {
          text: true
        },
        _avg: {
          length: true,
          frequency: true
        },
        _min: {
          length: true
        },
        _max: {
          length: true
        }
      });

      return {
        difficulty,
        language,
        config,
        totalWords: stats._count.text,
        avgLength: Math.round(stats._avg.length || 0),
        avgFrequency: Math.round(stats._avg.frequency || 0),
        lengthRange: `${stats._min.length}-${stats._max.length}`
      };

    } catch (error) {
      console.error('❌ Erreur stats:', error);
      return { error: error.message };
    }
  }

  // 🧪 Tester la randomisation
  async testRandomness(difficulty = 'normal', language = 'fr', count = 10) {
    console.log(`🧪 Test de randomisation: ${count} mots (${difficulty}, ${language})`);
    
    const words = [];
    const uniqueWords = new Set();
    
    for (let i = 0; i < count; i++) {
      try {
        const word = await this.getRandomWord(difficulty, language, 1);
        words.push(word.text);
        uniqueWords.add(word.text);
        
        // Petite pause pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        console.error(`❌ Erreur mot ${i + 1}:`, error);
      }
    }
    
    const uniquenessRate = (uniqueWords.size / words.length * 100).toFixed(1);
    
    console.log(`📊 Résultats:`);
    console.log(`   Total: ${words.length} mots`);
    console.log(`   Uniques: ${uniqueWords.size} mots`);
    console.log(`   Taux d'unicité: ${uniquenessRate}%`);
    console.log(`   Mots: ${words.join(', ')}`);
    
    return {
      totalWords: words.length,
      uniqueWords: uniqueWords.size,
      uniquenessRate: parseFloat(uniquenessRate),
      words: words,
      uniqueWordsList: Array.from(uniqueWords)
    };
  }
}

export default new RandomWordService();
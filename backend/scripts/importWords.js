// backend/scripts/importWords.js
// 📝 Import automatique des mots depuis le dossier words/ vers la base

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

class WordsImporter {
  constructor() {
    this.stats = {
      totalProcessed: 0,
      totalImported: 0,
      duplicatesSkipped: 0,
      errors: 0,
      languages: {},
      startTime: Date.now()
    };
  }

  // 📂 Analyser la structure du dossier words
  async analyzeWordsStructure() {
    const wordsDir = path.join(__dirname, '..', 'words');
    console.log('📂 Analyse du dossier:', wordsDir);

    try {
      const languages = await fs.readdir(wordsDir);
      const structure = {};

      for (const language of languages) {
        const langPath = path.join(wordsDir, language);
        const stat = await fs.stat(langPath);

        if (stat.isDirectory()) {
          const files = await fs.readdir(langPath);
          structure[language] = {
            path: langPath,
            files: files.filter(f => f.endsWith('.txt'))
          };
        }
      }

      console.log('📊 Structure détectée:', structure);
      return structure;
    } catch (error) {
      console.error('❌ Erreur lecture dossier words:', error);
      throw error;
    }
  }

  // 🎯 Déterminer la difficulté basée sur la longueur du mot
  calculateDifficulty(word) {
    const length = word.length;
    
    // Classification par longueur + analyse de complexité
    let baseDifficulty;
    if (length <= 4) baseDifficulty = 1;        // easy
    else if (length <= 7) baseDifficulty = 3;   // normal  
    else if (length <= 10) baseDifficulty = 6;  // hard
    else baseDifficulty = 8;                    // expert

    // Ajustements pour la complexité
    const complexChars = /[àâäéèêëîïôöùûüÿç]/gi;
    const hasComplexChars = complexChars.test(word);
    
    const consonantClusters = /[bcdfghjklmnpqrstvwxz]{3,}/gi;
    const hasConsonantClusters = consonantClusters.test(word);

    if (hasComplexChars) baseDifficulty += 1;
    if (hasConsonantClusters) baseDifficulty += 1;

    return Math.min(10, Math.max(1, baseDifficulty));
  }

  // 📄 Traiter un fichier de mots
  async processWordFile(filePath, language) {
    console.log(`📄 Traitement: ${filePath}`);
    
    try {
      // Lire le fichier en chunks pour les gros fichiers
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      console.log(`📊 ${lines.length} lignes trouvées dans ${path.basename(filePath)}`);
      
      const words = [];
      const seenWords = new Set();

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line || line.length < 2) continue;
        
        // Nettoyer le mot
        const word = this.cleanWord(line);
        if (!word) continue;

        // Éviter les doublons dans le même fichier
        const wordKey = word.toLowerCase();
        if (seenWords.has(wordKey)) {
          continue;
        }
        seenWords.add(wordKey);

        const difficulty = this.calculateDifficulty(word);
        
        words.push({
          text: word,
          language: language.toLowerCase(),
          difficulty,
          frequency: this.calculateFrequency(word, i, lines.length),
          length: word.length,
          category: this.getCategory(difficulty),
          tags: this.generateTags(word, difficulty),
          metadata: {
            source: path.basename(filePath),
            lineNumber: i + 1,
            imported: true
          }
        });

        this.stats.totalProcessed++;

        // Progress indicator pour gros fichiers
        if (this.stats.totalProcessed % 1000 === 0) {
          console.log(`   📈 ${this.stats.totalProcessed} mots traités...`);
        }
      }

      console.log(`✅ ${words.length} mots uniques extraits de ${path.basename(filePath)}`);
      return words;

    } catch (error) {
      console.error(`❌ Erreur traitement ${filePath}:`, error);
      this.stats.errors++;
      return [];
    }
  }

  // 🧹 Nettoyer un mot
  cleanWord(word) {
    // Retirer les caractères indésirables mais garder les accents
    const cleaned = word
      .trim()
      .replace(/[0-9\[\](){}'"«»„""]/g, '') // Retirer chiffres et ponctuation
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .replace(/^[^a-zA-ZàâäéèêëîïôöùûüÿçÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÇ]+/, '') // Retirer préfixes non-lettres
      .replace(/[^a-zA-ZàâäéèêëîïôöùûüÿçÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÇ\s-]+$/, ''); // Retirer suffixes non-lettres

    // Valider le mot
    if (cleaned.length < 2 || cleaned.length > 50) return null;
    if (!/[a-zA-ZàâäéèêëîïôöùûüÿçÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÇ]/.test(cleaned)) return null;

    return cleaned;
  }

  // 📊 Calculer la fréquence approximative
  calculateFrequency(word, position, totalWords) {
    // Les mots en début de fichier sont souvent plus fréquents
    const positionWeight = Math.max(1, 10 - Math.floor((position / totalWords) * 9));
    
    // Mots courts = plus fréquents généralement
    const lengthWeight = Math.max(1, 8 - word.length);
    
    return Math.min(10, Math.max(1, Math.floor((positionWeight + lengthWeight) / 2)));
  }

  // 🏷️ Obtenir la catégorie
  getCategory(difficulty) {
    if (difficulty <= 2) return 'easy';
    if (difficulty <= 4) return 'normal';
    if (difficulty <= 7) return 'hard';
    return 'expert';
  }

  // 🏷️ Générer des tags
  generateTags(word, difficulty) {
    const tags = [this.getCategory(difficulty)];
    
    if (word.length <= 4) tags.push('short');
    else if (word.length >= 10) tags.push('long');
    
    if (/[àâäéèêëîïôöùûüÿç]/i.test(word)) tags.push('accents');
    if (word.includes('-')) tags.push('hyphenated');
    if (/^[A-Z]/.test(word)) tags.push('capitalized');
    
    return tags;
  }

  // 💾 Importer les mots dans la base (par batch)
  async importWordsToDatabase(words, gameTypeId, batchSize = 500) {
    console.log(`💾 Import de ${words.length} mots en batches de ${batchSize}...`);
    
    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);
      
      try {
        // Utiliser createMany avec skipDuplicates pour performance
        const result = await prisma.word.createMany({
          data: batch.map(word => ({
            ...word,
            gameTypeId
          })),
          skipDuplicates: true
        });

        imported += result.count;
        
        // Calculer les doublons skippés dans ce batch
        const skippedInBatch = batch.length - result.count;
        skipped += skippedInBatch;
        
        console.log(`   ✅ Batch ${Math.floor(i/batchSize) + 1}: ${result.count} importés, ${skippedInBatch} doublons`);
        
      } catch (error) {
        console.error(`❌ Erreur import batch ${Math.floor(i/batchSize) + 1}:`, error);
        this.stats.errors++;
        
        // En cas d'erreur de batch, essayer un par un
        for (const word of batch) {
          try {
            await prisma.word.upsert({
              where: {
                gameTypeId_text_language: {
                  gameTypeId,
                  text: word.text,
                  language: word.language
                }
              },
              update: {}, // Ne pas écraser si existe
              create: { ...word, gameTypeId }
            });
            imported++;
          } catch (singleError) {
            skipped++;
          }
        }
      }

      // Progress report
      console.log(`   📈 Progression: ${Math.min(i + batchSize, words.length)}/${words.length} (${Math.round((i + batchSize) / words.length * 100)}%)`);
    }

    return { imported, skipped };
  }

  // 🚀 Processus principal d'import
  async importAllWords() {
    console.log('🚀 Début de l\'import des mots...\n');

    try {
      // 1. Obtenir le GameType "typing"
      const typingGame = await prisma.gameType.findUnique({
        where: { slug: 'typing' }
      });

      if (!typingGame) {
        throw new Error('GameType "typing" non trouvé. Exécutez d\'abord le seed.');
      }

      console.log(`🎮 GameType trouvé: ${typingGame.name} (${typingGame.id})\n`);

      // 2. Analyser la structure des fichiers
      const wordsStructure = await this.analyzeWordsStructure();

      // 3. Traiter chaque langue
      for (const [languageName, languageData] of Object.entries(wordsStructure)) {
        console.log(`\n🌐 === Traitement de la langue: ${languageName} ===`);
        
        this.stats.languages[languageName] = {
          files: 0,
          processed: 0,
          imported: 0,
          skipped: 0
        };

        const allWordsForLanguage = [];

        // Traiter chaque fichier de cette langue
        for (const fileName of languageData.files) {
          const filePath = path.join(languageData.path, fileName);
          console.log(`📄 Fichier: ${fileName}`);

          const words = await this.processWordFile(filePath, languageName);
          allWordsForLanguage.push(...words);
          
          this.stats.languages[languageName].files++;
          this.stats.languages[languageName].processed += words.length;
        }

        // Import groupé pour cette langue
        if (allWordsForLanguage.length > 0) {
          console.log(`\n💾 Import de ${allWordsForLanguage.length} mots ${languageName}...`);
          
          const { imported, skipped } = await this.importWordsToDatabase(
            allWordsForLanguage, 
            typingGame.id
          );

          this.stats.languages[languageName].imported = imported;
          this.stats.languages[languageName].skipped = skipped;
          this.stats.totalImported += imported;
          this.stats.duplicatesSkipped += skipped;

          console.log(`✅ ${languageName}: ${imported} importés, ${skipped} doublons skippés`);
        }
      }

      // 4. Statistiques finales
      await this.printFinalStats();

    } catch (error) {
      console.error('💥 Erreur lors de l\'import:', error);
      throw error;
    }
  }

  // 📊 Afficher les statistiques finales
  async printFinalStats() {
    const duration = Math.round((Date.now() - this.stats.startTime) / 1000);
    
    console.log('\n🎉 === IMPORT TERMINÉ ===');
    console.log(`⏱️  Durée: ${duration}s`);
    console.log(`📝 Mots traités: ${this.stats.totalProcessed}`);
    console.log(`💾 Mots importés: ${this.stats.totalImported}`);
    console.log(`🔄 Doublons skippés: ${this.stats.duplicatesSkipped}`);
    console.log(`❌ Erreurs: ${this.stats.errors}`);

    console.log('\n📊 Par langue:');
    for (const [lang, stats] of Object.entries(this.stats.languages)) {
      console.log(`   ${lang}: ${stats.imported} importés (${stats.files} fichiers)`);
    }

    // Vérification finale dans la base
    try {
      const totalInDB = await prisma.word.count();
      const byLanguage = await prisma.word.groupBy({
        by: ['language'],
        _count: { id: true }
      });

      console.log('\n🗄️ Vérification base de données:');
      console.log(`📊 Total mots en base: ${totalInDB}`);
      
      for (const lang of byLanguage) {
        console.log(`   ${lang.language}: ${lang._count.id} mots`);
      }

    } catch (error) {
      console.error('❌ Erreur vérification base:', error);
    }
  }
}

// 🎯 Fonction utilitaire pour nettoyer et réimporter
async function cleanAndReimport() {
  console.log('🧹 Nettoyage des mots existants...');
  
  try {
    const deleted = await prisma.word.deleteMany({
      where: {
        metadata: {
          path: ['imported'],
          equals: true
        }
      }
    });
    
    console.log(`🗑️ ${deleted.count} mots importés supprimés`);
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error);
  }
}

// 🚀 Exécution principale
async function main() {
  const args = process.argv.slice(2);
  const shouldClean = args.includes('--clean');

  try {
    if (shouldClean) {
      await cleanAndReimport();
    }

    const importer = new WordsImporter();
    await importer.importAllWords();

    console.log('\n✨ Import réussi ! Vos mots sont maintenant dans la base de données.');
    
  } catch (error) {
    console.error('💥 Échec de l\'import:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { WordsImporter };
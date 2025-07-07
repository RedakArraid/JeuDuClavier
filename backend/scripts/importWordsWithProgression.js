// backend/scripts/importWordsWithProgression.js
// 📝 Import automatique des mots avec progression intelligente (VERSION DEBUG)

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

class SmartWordsImporter {
  constructor() {
    this.stats = {
      totalProcessed: 0,
      totalImported: 0,
      byLength: {},
      byLanguage: {},
      errors: 0,
      startTime: Date.now()
    };
  }

  // 📂 Importer tous les mots depuis le dossier words
  async importAllWordsFromFiles() {
    console.log('🚀 Import de tous les mots depuis backend/words/...\n');

    try {
      const wordsDir = path.join(__dirname, '..', 'words');
      console.log('📂 Dossier words:', wordsDir);
      
      // Vérifier que le dossier existe
      try {
        await fs.access(wordsDir);
        console.log('✅ Dossier words accessible');
      } catch (error) {
        throw new Error(`Dossier words non accessible: ${wordsDir}`);
      }
      
      const languages = await fs.readdir(wordsDir);
      console.log('🌐 Langues détectées:', languages);

      // Vérifier la connexion à la base
      console.log('🔍 Vérification connexion base de données...');
      await prisma.$connect();
      console.log('✅ Connexion DB réussie');

      const typingGame = await prisma.gameType.findUnique({
        where: { slug: 'typing' }
      });

      let gameTypeId;

      if (!typingGame) {
        console.log('❌ GameType "typing" non trouvé');
        console.log('🔧 Création du GameType "typing"...');
        
        const newTypingGame = await prisma.gameType.create({
          data: {
            slug: 'typing',
            name: 'Jeu de Dactylographie',
            description: 'Testez votre vitesse de frappe',
            icon: 'keyboard',
            minPlayers: 1,
            maxPlayers: 8,
            settings: {
              allowBackspace: false,
              showWPM: true,
              showAccuracy: true
            }
          }
        });
        
        console.log(`✅ GameType créé: ${newTypingGame.name}`);
        
        // Créer aussi les modes de base
        const modes = [
          { slug: 'easy', name: 'Facile', difficulty: 1 },
          { slug: 'normal', name: 'Normal', difficulty: 3 },
          { slug: 'hard', name: 'Difficile', difficulty: 6 },
          { slug: 'expert', name: 'Expert', difficulty: 8 }
        ];
        
        for (const mode of modes) {
          await prisma.gameMode.create({
            data: {
              gameTypeId: newTypingGame.id,
              slug: mode.slug,
              name: mode.name,
              difficulty: mode.difficulty,
              settings: {}
            }
          });
        }
        
        console.log('✅ Modes de jeu créés');
        gameTypeId = newTypingGame.id;
        
      } else {
        console.log(`🎮 GameType trouvé: ${typingGame.name}`);
        gameTypeId = typingGame.id;
      }

      // Traiter chaque langue
      for (const language of languages) {
        const langPath = path.join(wordsDir, language);
        
        try {
          const stat = await fs.stat(langPath);
          if (!stat.isDirectory()) {
            console.log(`⚠️ ${language} n'est pas un dossier, ignoré`);
            continue;
          }

          console.log(`\n🌐 === Traitement de la langue: ${language} ===`);
          
          const files = await fs.readdir(langPath);
          const txtFiles = files.filter(f => f.endsWith('.txt'));
          console.log(`📁 Fichiers .txt trouvés: ${txtFiles.join(', ')}`);

          if (txtFiles.length === 0) {
            console.log(`⚠️ Aucun fichier .txt trouvé dans ${language}`);
            continue;
          }

          this.stats.byLanguage[language] = {
            files: txtFiles.length,
            processed: 0,
            imported: 0,
            byLength: {}
          };

          // Traiter chaque fichier de cette langue
          for (const file of txtFiles) {
            const filePath = path.join(langPath, file);
            console.log(`\n📄 Traitement: ${file}`);
            console.log(`   📍 Chemin: ${filePath}`);

            await this.processFileWithProgression(filePath, language, gameTypeId);
          }

          console.log(`✅ ${language}: ${this.stats.byLanguage[language].imported} mots importés`);
          
        } catch (error) {
          console.error(`❌ Erreur traitement langue ${language}:`, error);
          this.stats.errors++;
        }
      }

      await this.printImportStats();
      await this.testProgressionSystem();

    } catch (error) {
      console.error('💥 Erreur lors de l\'import:', error);
      console.error('📋 Stack trace:', error.stack);
      throw error;
    }
  }

  // 📄 Traiter un fichier avec classification intelligente
  async processFileWithProgression(filePath, language, gameTypeId) {
    try {
      console.log(`   🔍 Lecture du fichier...`);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // 🆕 NOUVEAU: Traitement des mots séparés par virgules
      console.log(`   📊 Taille du fichier: ${Math.round(content.length / 1024)} KB`);
      
      // Diviser par virgules ET par lignes pour être sûr
      let allWords = [];
      
      // D'abord essayer de diviser par virgules
      if (content.includes(',')) {
        console.log(`   🔍 Format détecté: mots séparés par virgules`);
        allWords = content.split(',');
      } else {
        console.log(`   🔍 Format détecté: mots séparés par lignes`);
        allWords = content.split('\n');
      }
      
      console.log(`   📊 ${allWords.length} mots bruts trouvés`);

      const wordsByLength = {};
      const seenWords = new Set();
      let processed = 0;
      let validWords = 0;
      let skippedEmpty = 0;
      let skippedInvalid = 0;
      let skippedDuplicates = 0;

      for (let i = 0; i < allWords.length; i++) {
        const rawWord = allWords[i];
        if (!rawWord || rawWord.trim().length === 0) {
          skippedEmpty++;
          continue;
        }

        const word = this.cleanWord(rawWord.trim());
        if (!word || word.length < 2 || word.length > 15) {
          skippedInvalid++;
          continue;
        }

        const wordKey = `${word.toLowerCase()}_${language.toLowerCase()}`;
        if (seenWords.has(wordKey)) {
          skippedDuplicates++;
          continue;
        }
        seenWords.add(wordKey);

        const length = word.length;
        if (!wordsByLength[length]) {
          wordsByLength[length] = [];
        }

        wordsByLength[length].push({
          text: word,
          language: language.toLowerCase(),
          length: length,
          difficulty: this.calculateSmartDifficulty(word, length),
          frequency: this.calculateFrequency(word),
          category: this.getCategoryFromLength(length),
          tags: this.generateProgressiveTags(word, length),
          metadata: {
            source: path.basename(filePath),
            imported: true,
            smartProgression: true
          }
        });

        processed++;
        validWords++;
        this.stats.totalProcessed++;

        if (processed % 5000 === 0) {
          console.log(`     📈 ${processed} mots traités...`);
        }
      }

      console.log(`   ✅ ${validWords} mots valides extraits`);
      console.log(`   ⚠️ ${skippedEmpty} mots vides ignorés`);
      console.log(`   ⚠️ ${skippedInvalid} mots invalides ignorés`);
      console.log(`   ⚠️ ${skippedDuplicates} doublons ignorés`);
      console.log(`   📏 Distribution par longueur:`);

      // Afficher la distribution
      for (const [length, words] of Object.entries(wordsByLength).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
        console.log(`      ${length} lettres: ${words.length} mots`);
      }

      // Import par longueur pour optimisation
      let imported = 0;
      console.log(`   💾 Import en base de données...`);

      for (const [length, words] of Object.entries(wordsByLength)) {
        if (words.length === 0) continue;

        try {
          const result = await prisma.word.createMany({
            data: words.map(word => ({ ...word, gameTypeId })),
            skipDuplicates: true
          });

          imported += result.count;
          
          // Statistiques par longueur
          if (!this.stats.byLength[length]) {
            this.stats.byLength[length] = 0;
          }
          this.stats.byLength[length] += result.count;

          if (!this.stats.byLanguage[language].byLength[length]) {
            this.stats.byLanguage[language].byLength[length] = 0;
          }
          this.stats.byLanguage[language].byLength[length] += result.count;

          console.log(`     ✅ Longueur ${length}: ${result.count}/${words.length} importés (${words.length - result.count} doublons)`);

        } catch (error) {
          console.error(`     ❌ Erreur import longueur ${length}:`, error);
          this.stats.errors++;
        }
      }

      this.stats.byLanguage[language].processed += processed;
      this.stats.byLanguage[language].imported += imported;
      this.stats.totalImported += imported;

      console.log(`   🎉 Total importé depuis ce fichier: ${imported} mots`);

    } catch (error) {
      console.error(`❌ Erreur traitement ${filePath}:`, error);
      console.error(`📋 Détail erreur:`, error.stack);
      this.stats.errors++;
    }
  }

  // 🧹 Nettoyer un mot intelligemment
  cleanWord(word) {
    if (!word) return null;

    const cleaned = word
      .trim()
      .replace(/[0-9\[\](){}'"«»„""\-_]/g, '') // Retirer chiffres et ponctuation
      .replace(/\s+/g, '') // Retirer tous les espaces
      .toLowerCase();

    // Valider que c'est bien un mot
    if (cleaned.length < 2 || cleaned.length > 15) return null;
    if (!/^[a-záàâäéèêëíìîïóòôöúùûüÿç]+$/i.test(cleaned)) return null;

    return cleaned;
  }

  // 🎯 Calculer difficulté intelligente
  calculateSmartDifficulty(word, length) {
    let difficulty = 1;

    if (length <= 3) difficulty = 1;
    else if (length <= 5) difficulty = 2;
    else if (length <= 7) difficulty = 3;
    else difficulty = 4;

    if (/[áàâäéèêëíìîïóòôöúùûüÿç]/.test(word)) difficulty += 0.5;
    if (/[qwxzj]/.test(word)) difficulty += 0.5;
    if (/(.)\1{2,}/.test(word)) difficulty += 0.5;

    return Math.min(4, Math.max(1, Math.round(difficulty)));
  }

  // 📊 Calculer fréquence
  calculateFrequency(word) {
    let frequency = 5;
    if (word.length <= 4) frequency += 3;
    else if (word.length >= 8) frequency -= 2;
    if (!/[áàâäéèêëíìîïóòôöúùûüÿç]/.test(word)) frequency += 1;
    return Math.min(10, Math.max(1, frequency));
  }

  // 🏷️ Catégorie basée sur longueur
  getCategoryFromLength(length) {
    if (length <= 3) return 'short';
    if (length <= 5) return 'medium';
    if (length <= 7) return 'long';
    return 'very-long';
  }

  // 🏷️ Tags progressifs
  generateProgressiveTags(word, length) {
    const tags = [this.getCategoryFromLength(length)];
    if (/[áàâäéèêëíìîïóòôöúùûüÿç]/.test(word)) tags.push('accents');
    if (length >= 8) tags.push('challenging');
    if (/^[aeiou]/.test(word)) tags.push('vowel-start');
    return tags;
  }

  // 📊 Afficher statistiques d'import
  async printImportStats() {
    const duration = Math.round((Date.now() - this.stats.startTime) / 1000);
    
    console.log('\n🎉 === IMPORT TERMINÉ ===');
    console.log(`⏱️  Durée: ${duration}s`);
    console.log(`📝 Mots traités: ${this.stats.totalProcessed}`);
    console.log(`💾 Mots importés: ${this.stats.totalImported}`);
    console.log(`❌ Erreurs: ${this.stats.errors}`);

    console.log('\n📏 Distribution globale par longueur:');
    for (const [length, count] of Object.entries(this.stats.byLength).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
      console.log(`   ${length} lettres: ${count} mots`);
    }

    console.log('\n🌐 Distribution par langue:');
    for (const [lang, stats] of Object.entries(this.stats.byLanguage)) {
      console.log(`   ${lang}: ${stats.imported} mots (${stats.files} fichiers)`);
    }

    try {
      const totalInDB = await prisma.word.count();
      console.log(`\n🗄️ Total mots en base: ${totalInDB}`);
    } catch (error) {
      console.error('❌ Erreur vérification base:', error);
    }
  }

  // 🧪 Tester le système de progression
  async testProgressionSystem() {
    console.log('\n🧪 === TEST DU SYSTÈME DE PROGRESSION ===');
    
    const DIFFICULTY_RULES = {
      easy: { name: 'Facile', baseLengths: [2, 3, 4], progressiveLengths: [5], unlockLevel: 4 },
      normal: { name: 'Normal', baseLengths: [3, 4, 5, 6], progressiveLengths: [7], unlockLevel: 4 },
      hard: { name: 'Difficile', baseLengths: [4, 5, 6, 7], progressiveLengths: [8], unlockLevel: 4 },
      expert: { name: 'Expert', baseLengths: [3, 4, 5], progressiveLengths: [6, 7, 8], unlockLevel: 4 }
    };

    for (const [difficulty, rules] of Object.entries(DIFFICULTY_RULES)) {
      console.log(`\n🎯 ${rules.name} (${difficulty}):`);
      console.log(`   📏 Base: mots de ${rules.baseLengths.join(', ')} lettres`);
      console.log(`   🔓 Niveau ${rules.unlockLevel}+: + mots de ${rules.progressiveLengths.join(', ')} lettres`);

      try {
        const baseCounts = await this.getWordsCountByLengths(rules.baseLengths);
        const progressiveCounts = await this.getWordsCountByLengths(rules.progressiveLengths);

        console.log(`   📦 Disponible base: ${baseCounts.total} mots`);
        console.log(`   📦 Disponible progression: ${progressiveCounts.total} mots`);
        
        if (baseCounts.total < 100) {
          console.log(`   ⚠️  ATTENTION: Peu de mots de base disponibles`);
        } else {
          console.log(`   ✅ Suffisant pour jouer`);
        }

        const level1Sample = await this.getSampleWords(rules.baseLengths, 'french', 3);
        console.log(`   🎮 Niveau 1: ${level1Sample.map(w => `${w.text}(${w.length})`).join(', ')}`);

        const allLengths = [...rules.baseLengths, ...rules.progressiveLengths];
        const level5Sample = await this.getSampleWords(allLengths, 'french', 3);
        console.log(`   🎮 Niveau 5+: ${level5Sample.map(w => `${w.text}(${w.length})`).join(', ')}`);

      } catch (error) {
        console.error(`   ❌ Erreur test ${difficulty}:`, error);
      }
    }

    console.log('\n✅ Système de progression configuré et prêt !');
  }

  async getWordsCountByLengths(lengths) {
    const counts = {};
    let total = 0;
    for (const length of lengths) {
      const count = await prisma.word.count({
        where: { length: parseInt(length), gameType: { slug: 'typing' } }
      });
      counts[length] = count;
      total += count;
    }
    return { counts, total };
  }

  async getSampleWords(lengths, language, count) {
    try {
      const words = await prisma.word.findMany({
        where: {
          language: language.toLowerCase(),
          length: { in: lengths },
          gameType: { slug: 'typing' }
        },
        select: { text: true, length: true },
        take: count * 2,
        orderBy: { frequency: 'desc' }
      });
      return words.sort(() => Math.random() - 0.5).slice(0, count);
    } catch (error) {
      console.error('❌ Erreur échantillon mots:', error);
      return [];
    }
  }
}

// 🎯 Fonction utilitaire pour nettoyer
async function cleanAndReimport() {
  console.log('🧹 Nettoyage des mots existants...');
  try {
    const deleted = await prisma.word.deleteMany({
      where: { metadata: { path: ['imported'], equals: true } }
    });
    console.log(`🗑️ ${deleted.count} mots importés supprimés`);
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error);
  }
}

// 🚀 Fonction principale
async function main() {
  console.log('🎯 === IMPORT INTELLIGENT DES MOTS ===\n');
  
  const args = process.argv.slice(2);
  
  try {
    if (args.includes('--clean')) {
      await cleanAndReimport();
    }

    const importer = new SmartWordsImporter();
    await importer.importAllWordsFromFiles();

    console.log('\n✨ Import et système de progression prêts !');
    
  } catch (error) {
    console.error('💥 Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { SmartWordsImporter };
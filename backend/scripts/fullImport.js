// backend/scripts/fullImport.js
// 🚀 Import complet optimisé par chunks

console.log('🎯 IMPORT COMPLET OPTIMISÉ');

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHUNK_SIZE = 1000; // Traiter par chunks de 1000 mots

async function processLanguage(languageName, filePath, gameTypeId, prisma) {
  console.log(`\n🌐 === ${languageName.toUpperCase()} ===`);
  
  try {
    console.log('📖 Lecture du fichier...');
    const content = await fs.readFile(filePath, 'utf-8');
    const allWords = content.split(',');
    console.log(`📊 ${allWords.length} mots bruts trouvés`);

    const stats = {
      processed: 0,
      imported: 0,
      skipped: 0,
      byLength: {}
    };

    // Traiter par chunks
    const totalChunks = Math.ceil(allWords.length / CHUNK_SIZE);
    console.log(`📦 Traitement en ${totalChunks} chunks de ${CHUNK_SIZE} mots`);

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, allWords.length);
      const chunk = allWords.slice(start, end);
      
      console.log(`\n📦 Chunk ${chunkIndex + 1}/${totalChunks} (${start}-${end})`);
      
      const cleanWords = [];
      
      for (const rawWord of chunk) {
        const word = cleanWord(rawWord.trim(), languageName);
        if (word) {
          cleanWords.push(word);
          stats.processed++;
          
          // Statistiques par longueur
          if (!stats.byLength[word.length]) {
            stats.byLength[word.length] = 0;
          }
          stats.byLength[word.length]++;
        } else {
          stats.skipped++;
        }
      }

      if (cleanWords.length > 0) {
        try {
          const result = await prisma.word.createMany({
            data: cleanWords.map(word => ({ ...word, gameTypeId })),
            skipDuplicates: true
          });
          
          stats.imported += result.count;
          const duplicates = cleanWords.length - result.count;
          
          console.log(`   ✅ ${result.count} importés, ${duplicates} doublons`);
        } catch (error) {
          console.error(`   ❌ Erreur import chunk: ${error.message}`);
        }
      }
      
      // Progress
      const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
      console.log(`   📈 Progression: ${progress}% (${stats.imported} importés)`);
    }

    console.log(`\n✅ ${languageName} terminé:`);
    console.log(`   📝 Traités: ${stats.processed}`);
    console.log(`   💾 Importés: ${stats.imported}`);
    console.log(`   ⚠️ Ignorés: ${stats.skipped}`);
    console.log(`   📏 Distribution par longueur:`);
    
    for (const [length, count] of Object.entries(stats.byLength).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
      console.log(`      ${length} lettres: ${count} mots`);
    }

    return stats;

  } catch (error) {
    console.error(`❌ Erreur ${languageName}:`, error);
    return { processed: 0, imported: 0, skipped: 0, byLength: {} };
  }
}

function cleanWord(rawWord, language) {
  if (!rawWord || rawWord.length < 2) return null;
  
  // Nettoyer le mot
  const cleaned = rawWord
    .toLowerCase()
    .replace(/[^a-záàâäéèêëíìîïóòôöúùûüÿç]/g, '')
    .trim();
  
  if (cleaned.length < 2 || cleaned.length > 15) return null;
  
  // Calculer les propriétés
  const length = cleaned.length;
  const difficulty = Math.min(4, Math.floor(length / 3) + 1);
  const frequency = Math.max(1, 8 - length + (Math.random() * 2));
  
  let category;
  if (length <= 4) category = 'short';
  else if (length <= 7) category = 'medium';
  else category = 'long';
  
  const tags = [category];
  if (/[áàâäéèêëíìîïóòôöúùûüÿç]/.test(cleaned)) tags.push('accents');
  if (length >= 8) tags.push('challenging');
  
  return {
    text: cleaned,
    language: language.toLowerCase(),
    length,
    difficulty,
    frequency: Math.round(frequency),
    category,
    tags,
    metadata: {
      imported: true,
      language: language,
      source: 'fullImport'
    }
  };
}

async function testProgressionAfterImport(prisma) {
  console.log('\n🧪 === TEST DU SYSTÈME DE PROGRESSION ===');
  
  const DIFFICULTY_RULES = {
    easy: { name: 'Facile', baseLengths: [2, 3, 4], progressiveLengths: [5], unlockLevel: 4 },
    normal: { name: 'Normal', baseLengths: [3, 4, 5, 6], progressiveLengths: [7], unlockLevel: 4 },
    hard: { name: 'Difficile', baseLengths: [4, 5, 6, 7], progressiveLengths: [8], unlockLevel: 4 },
    expert: { name: 'Expert', baseLengths: [3, 4, 5], progressiveLengths: [6, 7, 8], unlockLevel: 4 }
  };

  for (const [difficulty, rules] of Object.entries(DIFFICULTY_RULES)) {
    console.log(`\n🎯 ${rules.name}:`);
    
    try {
      // Compter mots de base
      const baseCount = await prisma.word.count({
        where: {
          length: { in: rules.baseLengths },
          gameType: { slug: 'typing' }
        }
      });
      
      // Compter mots progressifs
      const progressiveCount = await prisma.word.count({
        where: {
          length: { in: rules.progressiveLengths },
          gameType: { slug: 'typing' }
        }
      });
      
      console.log(`   📦 Base (${rules.baseLengths.join(',')}): ${baseCount} mots`);
      console.log(`   🔓 Progression (${rules.progressiveLengths.join(',')}): ${progressiveCount} mots`);
      console.log(`   ✅ ${baseCount > 100 ? 'Suffisant' : '⚠️ Peu de mots'}`);
      
      // Exemples de mots
      const sampleWords = await prisma.word.findMany({
        where: {
          length: { in: rules.baseLengths },
          gameType: { slug: 'typing' }
        },
        take: 5,
        orderBy: { frequency: 'desc' }
      });
      
      console.log(`   🎮 Exemples: ${sampleWords.map(w => `${w.text}(${w.length})`).join(', ')}`);
      
    } catch (error) {
      console.error(`   ❌ Erreur test ${difficulty}: ${error.message}`);
    }
  }
}

async function fullImport() {
  let prisma;
  
  try {
    console.log('1. Connexion à la base...');
    prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Connecté');

    console.log('2. Vérification GameType...');
    const typingGame = await prisma.gameType.findUnique({
      where: { slug: 'typing' }
    });
    
    if (!typingGame) {
      throw new Error('GameType "typing" non trouvé');
    }
    console.log(`✅ GameType: ${typingGame.name}`);

    console.log('3. Nettoyage des anciens imports...');
    const deleted = await prisma.word.deleteMany({
      where: {
        metadata: {
          path: ['imported'],
          equals: true
        }
      }
    });
    console.log(`🗑️ ${deleted.count} anciens mots supprimés`);

    const totalStats = {
      processed: 0,
      imported: 0,
      skipped: 0,
      languages: {}
    };

    // Import French
    const frenchPath = path.join(__dirname, '..', 'words', 'French', 'French.txt');
    const frenchStats = await processLanguage('French', frenchPath, typingGame.id, prisma);
    totalStats.languages.french = frenchStats;
    totalStats.processed += frenchStats.processed;
    totalStats.imported += frenchStats.imported;
    totalStats.skipped += frenchStats.skipped;

    // Import English
    const englishPath = path.join(__dirname, '..', 'words', 'English', 'English.txt');
    const englishStats = await processLanguage('English', englishPath, typingGame.id, prisma);
    totalStats.languages.english = englishStats;
    totalStats.processed += englishStats.processed;
    totalStats.imported += englishStats.imported;
    totalStats.skipped += englishStats.skipped;

    console.log('\n🎉 === IMPORT TERMINÉ ===');
    console.log(`📝 Total traités: ${totalStats.processed}`);
    console.log(`💾 Total importés: ${totalStats.imported}`);
    console.log(`⚠️ Total ignorés: ${totalStats.skipped}`);

    // Vérification finale
    const finalCount = await prisma.word.count();
    console.log(`📊 Mots en base: ${finalCount}`);

    // Test du système de progression
    await testProgressionAfterImport(prisma);

    console.log('\n✨ SUCCÈS ! Votre jeu a maintenant une base de mots massive !');

  } catch (error) {
    console.error('💥 ERREUR:', error);
    console.error('📋 Stack:', error.stack);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
      console.log('🔌 Déconnecté');
    }
  }
}

// Lancement avec gestion d'erreurs
console.log('🚀 Début import complet...');
fullImport()
  .then(() => {
    console.log('✅ Import complet terminé avec succès !');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
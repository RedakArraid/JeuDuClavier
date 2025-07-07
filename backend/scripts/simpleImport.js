// backend/scripts/simpleImport.js
// 🚀 Import direct et simple avec logging forcé

console.log('🎯 DÉBUT IMPORT SIMPLE');

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function simpleImport() {
  let prisma;
  
  try {
    console.log('1. Connexion Prisma...');
    prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Connecté');

    console.log('2. Recherche GameType...');
    const typingGame = await prisma.gameType.findUnique({
      where: { slug: 'typing' }
    });
    console.log(`✅ GameType trouvé: ${typingGame.name}`);

    console.log('3. Lecture fichier French...');
    const frenchPath = path.join(__dirname, '..', 'words', 'French', 'French.txt');
    console.log(`📂 Chemin: ${frenchPath}`);
    
    const content = await fs.readFile(frenchPath, 'utf-8');
    console.log(`📊 Taille: ${Math.round(content.length / 1024)} KB`);

    console.log('4. Division par virgules...');
    const allWords = content.split(',');
    console.log(`📝 Mots bruts: ${allWords.length}`);

    console.log('5. Nettoyage des 1000 premiers mots...');
    const cleanWords = [];
    
    for (let i = 0; i < Math.min(1000, allWords.length); i++) {
      const raw = allWords[i].trim();
      if (raw.length >= 2 && raw.length <= 15) {
        const clean = raw.toLowerCase().replace(/[^a-záàâäéèêëíìîïóòôöúùûüÿç]/g, '');
        if (clean.length >= 2) {
          cleanWords.push({
            text: clean,
            language: 'french',
            length: clean.length,
            difficulty: Math.min(4, Math.floor(clean.length / 3) + 1),
            frequency: Math.max(1, 8 - clean.length),
            category: clean.length <= 4 ? 'short' : clean.length <= 7 ? 'medium' : 'long',
            tags: ['imported'],
            metadata: { imported: true }
          });
        }
      }
      
      if (i % 100 === 0) {
        console.log(`   Progression: ${i}/1000`);
      }
    }

    console.log(`6. Mots nettoyés: ${cleanWords.length}`);

    console.log('7. Import en base...');
    const result = await prisma.word.createMany({
      data: cleanWords.map(word => ({ ...word, gameTypeId: typingGame.id })),
      skipDuplicates: true
    });

    console.log(`✅ ${result.count} mots importés !`);

    console.log('8. Vérification...');
    const totalWords = await prisma.word.count();
    console.log(`📊 Total mots en base: ${totalWords}`);

    console.log('🎉 IMPORT RÉUSSI !');

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

// Forcer l'exécution
console.log('🚀 Lancement...');
simpleImport()
  .then(() => {
    console.log('✅ Terminé avec succès');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erreur finale:', error);
    process.exit(1);
  });

// backend/scripts/fixLanguages.js
// 🔧 Normaliser les codes de langues dans la base

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixLanguages() {
  console.log('🔧 === NORMALISATION DES LANGUES ===\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Connexion réussie\n');

    // 1. Analyser l'état actuel
    console.log('1️⃣ État actuel:');
    const langGroups = await prisma.word.groupBy({
      by: ['language'],
      _count: { text: true },
      orderBy: { _count: { text: 'desc' } }
    });

    langGroups.forEach(lang => {
      console.log(`   🌐 "${lang.language}": ${lang._count.text.toLocaleString()} mots`);
    });

    // 2. Normaliser vers des codes courts
    console.log('\n2️⃣ Normalisation:');
    
    // Anglais: english/en → en
    const englishUpdate = await prisma.word.updateMany({
      where: {
        language: { in: ['english', 'English', 'ENGLISH'] }
      },
      data: {
        language: 'en'
      }
    });
    console.log(`   🇺🇸 Anglais normalisé: ${englishUpdate.count} mots → "en"`);

    // Français: french/fr → fr  
    const frenchUpdate = await prisma.word.updateMany({
      where: {
        language: { in: ['french', 'French', 'FRENCH'] }
      },
      data: {
        language: 'fr'
      }
    });
    console.log(`   🇫🇷 Français normalisé: ${frenchUpdate.count} mots → "fr"`);

    // 3. Vérification finale
    console.log('\n3️⃣ État final:');
    const finalLangs = await prisma.word.groupBy({
      by: ['language'],
      _count: { text: true },
      orderBy: { _count: { text: 'desc' } }
    });

    finalLangs.forEach(lang => {
      console.log(`   🌐 "${lang.language}": ${lang._count.text.toLocaleString()} mots`);
    });

    // 4. Test de requête pour le jeu
    console.log('\n4️⃣ Test requête jeu:');
    const frSample = await prisma.word.findMany({
      where: { 
        language: 'fr',
        length: { gte: 3, lte: 5 }
      },
      take: 5,
      select: { text: true, length: true }
    });
    
    const enSample = await prisma.word.findMany({
      where: { 
        language: 'en',
        length: { gte: 3, lte: 5 }
      },
      take: 5,
      select: { text: true, length: true }
    });

    console.log(`   🇫🇷 Français: ${frSample.map(w => w.text).join(', ')}`);
    console.log(`   🇺🇸 Anglais: ${enSample.map(w => w.text).join(', ')}`);

    console.log('\n✅ Normalisation terminée !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixLanguages();
// backend/scripts/fixLanguagesSafe.js
// 🔧 Normalisation sécurisée avec gestion des doublons

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixLanguagesSafe() {
  console.log('🔧 === NORMALISATION SÉCURISÉE DES LANGUES ===\n');
  
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

    // 2. Stratégie : supprimer les doublons et normaliser
    console.log('\n2️⃣ Nettoyage des doublons:');

    // A. Supprimer les petites collections (en, fr, es avec 38 mots)
    console.log('   🗑️ Suppression des petites collections...');
    
    const deleteSmallEn = await prisma.word.deleteMany({
      where: { language: 'en' }
    });
    console.log(`   ❌ Supprimé ${deleteSmallEn.count} mots "en"`);

    const deleteSmallFr = await prisma.word.deleteMany({
      where: { language: 'fr' }
    });
    console.log(`   ❌ Supprimé ${deleteSmallFr.count} mots "fr"`);

    const deleteSmallEs = await prisma.word.deleteMany({
      where: { language: 'es' }
    });
    console.log(`   ❌ Supprimé ${deleteSmallEs.count} mots "es"`);

    // B. Maintenant normaliser sans risque de conflit
    console.log('\n3️⃣ Normalisation sans conflit:');
    
    // Anglais: english → en
    const englishUpdate = await prisma.word.updateMany({
      where: { language: 'english' },
      data: { language: 'en' }
    });
    console.log(`   🇺🇸 Anglais normalisé: ${englishUpdate.count.toLocaleString()} mots "english" → "en"`);

    // Français: french → fr
    const frenchUpdate = await prisma.word.updateMany({
      where: { language: 'french' },
      data: { language: 'fr' }
    });
    console.log(`   🇫🇷 Français normalisé: ${frenchUpdate.count.toLocaleString()} mots "french" → "fr"`);

    // 4. Vérification finale
    console.log('\n4️⃣ État final:');
    const finalLangs = await prisma.word.groupBy({
      by: ['language'],
      _count: { text: true },
      orderBy: { _count: { text: 'desc' } }
    });

    finalLangs.forEach(lang => {
      console.log(`   🌐 "${lang.language}": ${lang._count.text.toLocaleString()} mots`);
    });

    // 5. Test de requête pour le jeu
    console.log('\n5️⃣ Test requête jeu:');
    
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

    if (frSample.length > 0) {
      console.log(`   🇫🇷 Français (${frSample.length} trouvés): ${frSample.map(w => w.text).join(', ')}`);
    } else {
      console.log('   ⚠️ Aucun mot français trouvé pour le test');
    }

    if (enSample.length > 0) {
      console.log(`   🇺🇸 Anglais (${enSample.length} trouvés): ${enSample.map(w => w.text).join(', ')}`);
    } else {
      console.log('   ⚠️ Aucun mot anglais trouvé pour le test');
    }

    // 6. Statistiques finales
    const totalFinal = await prisma.word.count();
    console.log(`\n📊 Total final: ${totalFinal.toLocaleString()} mots`);

    console.log('\n✅ Normalisation terminée avec succès !');
    console.log('🎮 Prêt pour connecter au jeu !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('📋 Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

fixLanguagesSafe();
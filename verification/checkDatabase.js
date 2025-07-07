// verification/checkDatabase.js
// 🔍 Script pour vérifier l'état de la base de données

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 === VÉRIFICATION BASE DE DONNÉES ===\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Connexion à la base réussie\n');

    // 1. Vérifier GameType
    console.log('1️⃣ GameType:');
    const gameTypes = await prisma.gameType.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        _count: {
          select: { words: true }
        }
      }
    });
    
    gameTypes.forEach(gt => {
      console.log(`   📦 ${gt.name} (${gt.slug}): ${gt._count.words} mots`);
    });

    // 2. Compter les mots par langue
    console.log('\n2️⃣ Mots par langue:');
    const wordsByLang = await prisma.word.groupBy({
      by: ['language'],
      _count: {
        text: true
      },
      orderBy: {
        _count: {
          text: 'desc'
        }
      }
    });

    wordsByLang.forEach(lang => {
      console.log(`   🌐 ${lang.language}: ${lang._count.text} mots`);
    });

    // 3. Distribution par longueur
    console.log('\n3️⃣ Distribution par longueur:');
    const wordsByLength = await prisma.word.groupBy({
      by: ['length'],
      _count: {
        text: true
      },
      orderBy: {
        length: 'asc'
      }
    });

    wordsByLength.forEach(len => {
      console.log(`   📏 ${len.length} lettres: ${len._count.text} mots`);
    });

    // 4. Exemples de mots par difficulté
    console.log('\n4️⃣ Exemples par difficulté:');
    for (let diff = 1; diff <= 4; diff++) {
      const examples = await prisma.word.findMany({
        where: { difficulty: diff },
        take: 5,
        select: { text: true, length: true, language: true }
      });
      
      console.log(`   🎯 Difficulté ${diff}: ${examples.map(w => `${w.text}(${w.length})`).join(', ')}`);
    }

    // 5. Vérifier les métadonnées d'import
    console.log('\n5️⃣ Métadonnées:');
    const imported = await prisma.word.count({
      where: {
        metadata: {
          path: ['imported'],
          equals: true
        }
      }
    });
    console.log(`   📥 Mots importés: ${imported}`);

    // 6. Total final
    const total = await prisma.word.count();
    console.log(`\n📊 TOTAL: ${total} mots en base`);

    // 7. Test d'une requête de jeu
    console.log('\n7️⃣ Test requête jeu (français, difficulté 1):');
    const gameWords = await prisma.word.findMany({
      where: {
        language: 'french',
        difficulty: 1,
        length: { gte: 2, lte: 4 }
      },
      take: 10,
      orderBy: {
        frequency: 'desc'
      },
      select: {
        text: true,
        length: true,
        frequency: true
      }
    });

    console.log(`   🎮 ${gameWords.length} mots trouvés pour le jeu:`);
    gameWords.forEach(w => {
      console.log(`      ${w.text} (${w.length}L, fréq:${w.frequency})`);
    });

    console.log('\n✅ Vérification terminée !');

    if (total === 0) {
      console.log('\n⚠️  PROBLÈME: Aucun mot en base !');
      console.log('💡 Solution: Relancez npm run words:full');
    } else if (total < 1000) {
      console.log('\n⚠️  ATTENTION: Peu de mots importés');
      console.log('💡 Vérifiez les fichiers words/French/French.txt et words/English/English.txt');
    } else {
      console.log('\n🎉 PARFAIT: Base de données bien remplie !');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('📋 Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
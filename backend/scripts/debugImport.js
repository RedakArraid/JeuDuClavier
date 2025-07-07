// backend/scripts/debugImport.js
// 🐛 Script de debug pour import avec gestion d'erreurs complète

import { PrismaClient } from '@prisma/client';

async function testBasicConnection() {
  console.log('🔍 === TEST DE CONNEXION BASIQUE ===\n');
  
  try {
    console.log('1. Test de connexion Prisma...');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log('✅ Connexion Prisma réussie');
    
    console.log('2. Test de lecture GameType...');
    const gameTypes = await prisma.gameType.findMany();
    console.log(`✅ GameTypes trouvés: ${gameTypes.length}`);
    
    if (gameTypes.length > 0) {
      console.log('   GameTypes disponibles:');
      gameTypes.forEach(gt => {
        console.log(`   - ${gt.slug}: ${gt.name}`);
      });
    }
    
    console.log('3. Test de lecture des mots existants...');
    const wordsCount = await prisma.word.count();
    console.log(`✅ Mots en base: ${wordsCount}`);
    
    await prisma.$disconnect();
    console.log('✅ Déconnexion réussie');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    console.error('📋 Stack:', error.stack);
    return false;
  }
}

async function testFileAccess() {
  console.log('\n📂 === TEST D\'ACCÈS AUX FICHIERS ===\n');
  
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const wordsDir = path.join(__dirname, '..', 'words');
    
    console.log('1. Test d\'accès au dossier words...');
    console.log('   Chemin:', wordsDir);
    
    await fs.access(wordsDir);
    console.log('✅ Dossier words accessible');
    
    console.log('2. Liste des dossiers de langues...');
    const languages = await fs.readdir(wordsDir);
    console.log(`✅ Langues trouvées: ${languages.join(', ')}`);
    
    for (const language of languages) {
      const langPath = path.join(wordsDir, language);
      
      try {
        const stat = await fs.stat(langPath);
        if (stat.isDirectory()) {
          console.log(`\n3. Contenu du dossier ${language}:`);
          const files = await fs.readdir(langPath);
          console.log(`   Fichiers: ${files.join(', ')}`);
          
          // Tester le premier fichier .txt
          const txtFiles = files.filter(f => f.endsWith('.txt'));
          if (txtFiles.length > 0) {
            const firstFile = txtFiles[0];
            const filePath = path.join(langPath, firstFile);
            
            console.log(`\n4. Test de lecture: ${firstFile}`);
            const content = await fs.readFile(filePath, 'utf-8');
            
            console.log(`   Taille: ${Math.round(content.length / 1024)} KB`);
            console.log(`   Format détecté: ${content.includes(',') ? 'Virgules' : 'Lignes'}`);
            
            // Analyser le début
            const sample = content.substring(0, 500);
            console.log(`   Début du fichier: "${sample.substring(0, 100)}..."`);
            
            // Compter les éléments
            if (content.includes(',')) {
              const words = content.split(',');
              console.log(`   Nombre de mots (virgules): ${words.length}`);
              console.log(`   Premiers mots: ${words.slice(0, 5).map(w => `"${w.trim()}"`).join(', ')}`);
            } else {
              const lines = content.split('\n');
              console.log(`   Nombre de lignes: ${lines.length}`);
              console.log(`   Premières lignes: ${lines.slice(0, 5).map(l => `"${l.trim()}"`).join(', ')}`);
            }
          }
        }
      } catch (error) {
        console.error(`   ❌ Erreur avec ${language}:`, error.message);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur d\'accès fichiers:', error);
    console.error('📋 Stack:', error.stack);
    return false;
  }
}

async function testSmallImport() {
  console.log('\n🧪 === TEST D\'IMPORT SIMPLE ===\n');
  
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    // Vérifier/créer le GameType
    let typingGame = await prisma.gameType.findUnique({
      where: { slug: 'typing' }
    });
    
    if (!typingGame) {
      console.log('🔧 Création du GameType typing...');
      typingGame = await prisma.gameType.create({
        data: {
          slug: 'typing',
          name: 'Jeu de Dactylographie Test',
          description: 'Test import',
          icon: 'keyboard',
          minPlayers: 1,
          maxPlayers: 8,
          settings: {}
        }
      });
      console.log('✅ GameType créé');
    } else {
      console.log('✅ GameType typing trouvé');
    }
    
    // Test d'import de quelques mots
    console.log('🧪 Test d\'import de mots de test...');
    const testWords = [
      { text: 'test', language: 'french', length: 4, difficulty: 2, frequency: 5, category: 'medium', tags: ['test'], metadata: { test: true } },
      { text: 'mot', language: 'french', length: 3, difficulty: 1, frequency: 8, category: 'short', tags: ['test'], metadata: { test: true } },
      { text: 'ordinateur', language: 'french', length: 10, difficulty: 3, frequency: 3, category: 'long', tags: ['test'], metadata: { test: true } }
    ];
    
    const result = await prisma.word.createMany({
      data: testWords.map(word => ({ ...word, gameTypeId: typingGame.id })),
      skipDuplicates: true
    });
    
    console.log(`✅ ${result.count} mots de test importés`);
    
    // Vérifier qu'ils sont bien là
    const importedWords = await prisma.word.findMany({
      where: {
        gameTypeId: typingGame.id,
        metadata: { path: ['test'], equals: true }
      }
    });
    
    console.log(`✅ ${importedWords.length} mots de test vérifiés en base`);
    importedWords.forEach(word => {
      console.log(`   - ${word.text} (${word.length} lettres)`);
    });
    
    await prisma.$disconnect();
    return true;
    
  } catch (error) {
    console.error('❌ Erreur test d\'import:', error);
    console.error('📋 Stack:', error.stack);
    return false;
  }
}

async function main() {
  console.log('🐛 === DIAGNOSTIC COMPLET ===\n');
  
  const step1 = await testBasicConnection();
  const step2 = await testFileAccess();
  const step3 = await testSmallImport();
  
  console.log('\n📊 === RÉSUMÉ ===');
  console.log(`✅ Connexion DB: ${step1 ? 'OK' : 'ÉCHEC'}`);
  console.log(`✅ Accès fichiers: ${step2 ? 'OK' : 'ÉCHEC'}`);
  console.log(`✅ Import test: ${step3 ? 'OK' : 'ÉCHEC'}`);
  
  if (step1 && step2 && step3) {
    console.log('\n🎉 Tout fonctionne ! Vous pouvez maintenant lancer l\'import complet.');
    console.log('💡 Commande: npm run words:smart-import');
  } else {
    console.log('\n⚠️ Il y a des problèmes à résoudre avant l\'import.');
  }
}

// Wrapper global pour capturer TOUTES les erreurs
process.on('uncaughtException', (error) => {
  console.error('💥 ERREUR NON CAPTURÉE:', error);
  console.error('📋 Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 PROMESSE REJETÉE:', reason);
  console.error('📋 Promise:', promise);
  process.exit(1);
});

// Lancer le diagnostic
main().catch(error => {
  console.error('💥 ERREUR MAIN:', error);
  process.exit(1);
});
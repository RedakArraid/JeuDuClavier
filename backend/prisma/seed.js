// backend/prisma/seed.js
// 🌱 Seed pour Architecture Multi-Jeux Évolutive

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 🎮 Configuration des types de jeux
const GAME_TYPES = {
  typing: {
    slug: 'typing',
    name: 'Jeu de Dactylographie',
    description: 'Testez votre vitesse de frappe',
    icon: 'keyboard',
    minPlayers: 1,
    maxPlayers: 8,
    settings: {
      allowBackspace: false,
      showWPM: true,
      showAccuracy: true,
      wordLifetime: 10000
    },
    modes: {
      easy: { name: 'Facile', difficulty: 1, settings: { wordsPerMinute: 20 } },
      normal: { name: 'Normal', difficulty: 3, settings: { wordsPerMinute: 35 } },
      hard: { name: 'Difficile', difficulty: 6, settings: { wordsPerMinute: 50 } },
      expert: { name: 'Expert', difficulty: 8, settings: { wordsPerMinute: 70, reverseMode: true } },
      blitz: { name: 'Blitz', difficulty: 5, settings: { timeLimit: 60, wordsPerMinute: 40 } },
      marathon: { name: 'Marathon', difficulty: 4, settings: { timeLimit: 300, wordsPerMinute: 30 } }
    }
  },
  // 🧮 Exemple de jeu de maths (pour plus tard)
  math: {
    slug: 'math',
    name: 'Calcul Mental',
    description: 'Résolvez des opérations mathématiques rapidement',
    icon: 'calculator',
    minPlayers: 1,
    maxPlayers: 6,
    settings: {
      operations: ['addition', 'subtraction', 'multiplication'],
      showTimer: true,
      maxNumber: 100
    },
    modes: {
      easy: { name: 'Addition Simple', difficulty: 1, settings: { operations: ['addition'], maxNumber: 20 } },
      normal: { name: 'Mixte Facile', difficulty: 3, settings: { operations: ['addition', 'subtraction'], maxNumber: 50 } },
      hard: { name: 'Multiplication', difficulty: 6, settings: { operations: ['multiplication'], maxNumber: 12 } },
      expert: { name: 'Tout Mélangé', difficulty: 8, settings: { operations: ['addition', 'subtraction', 'multiplication', 'division'], maxNumber: 100 } }
    }
  }
};

// 📝 Mots de base pour le jeu de typing
const TYPING_WORDS = {
  fr: {
    easy: ['chat', 'chien', 'maison', 'eau', 'pain', 'soleil', 'lune', 'bleu', 'rouge', 'vert', 'livre', 'table', 'chaise', 'porte', 'main'],
    normal: ['ordinateur', 'telephone', 'internet', 'clavier', 'souris', 'ecran', 'fenetre', 'programme', 'fichier', 'dossier'],
    hard: ['developpement', 'programmation', 'algorithme', 'architecture', 'optimisation', 'interface', 'database', 'framework'],
    expert: ['extraordinaire', 'incomprehensible', 'anticonstitutionnellement', 'electroencephalographie', 'hippopotomonstrosesquipedaliophobie']
  },
  en: {
    easy: ['cat', 'dog', 'house', 'water', 'bread', 'sun', 'moon', 'blue', 'red', 'green', 'book', 'table', 'chair', 'door', 'hand'],
    normal: ['computer', 'phone', 'internet', 'keyboard', 'mouse', 'screen', 'window', 'program', 'file', 'folder'],
    hard: ['development', 'programming', 'algorithm', 'architecture', 'optimization', 'interface', 'database', 'framework'],
    expert: ['extraordinary', 'incomprehensible', 'antidisestablishmentarianism', 'electroencephalography', 'hippopotomonstrosesquippedaliophobia']
  },
  es: {
    easy: ['gato', 'perro', 'casa', 'agua', 'pan', 'sol', 'luna', 'azul', 'rojo', 'verde', 'libro', 'mesa', 'silla', 'puerta', 'mano'],
    normal: ['ordenador', 'telefono', 'internet', 'teclado', 'raton', 'pantalla', 'ventana', 'programa', 'archivo', 'carpeta'],
    hard: ['desarrollo', 'programacion', 'algoritmo', 'arquitectura', 'optimizacion', 'interfaz', 'basededatos', 'framework'],
    expert: ['extraordinario', 'incomprensible', 'electroencefalografia', 'otorrinolaringologia', 'esternocleidomastoideo']
  }
};

// 🏅 Achievements de base
const ACHIEVEMENTS = [
  // Achievements globaux
  { slug: 'first_game', name: 'Premier Pas', description: 'Terminez votre première partie', gameTypeId: null, rarity: 'COMMON', points: 10 },
  { slug: 'friend_maker', name: 'Sociable', description: 'Ajoutez votre premier ami', gameTypeId: null, rarity: 'COMMON', points: 15 },
  { slug: 'speed_demon', name: 'Démon de Vitesse', description: 'Atteignez 100 WPM', gameTypeId: null, rarity: 'RARE', points: 50 },
  
  // Achievements typing
  { slug: 'typing_rookie', name: 'Débutant Dactylographe', description: 'Terminez 10 parties de typing', gameType: 'typing', rarity: 'COMMON', points: 20 },
  { slug: 'typing_master', name: 'Maître Dactylographe', description: 'Atteignez 80 WPM en mode expert', gameType: 'typing', rarity: 'EPIC', points: 100 },
  { slug: 'perfect_accuracy', name: 'Précision Parfaite', description: 'Terminez une partie avec 100% de précision', gameType: 'typing', rarity: 'RARE', points: 75 },
  { slug: 'multilingual', name: 'Polyglotte', description: 'Jouez dans 3 langues différentes', gameType: 'typing', rarity: 'UNCOMMON', points: 30 },
  
  // Achievements math (pour plus tard)
  { slug: 'math_rookie', name: 'Apprenti Mathématicien', description: 'Résolvez 50 opérations', gameType: 'math', rarity: 'COMMON', points: 20 },
  { slug: 'calculation_speed', name: 'Éclair Mental', description: 'Résolvez 10 opérations en moins de 30 secondes', gameType: 'math', rarity: 'RARE', points: 60 }
];

async function main() {
  console.log('🌱 Starting database seed for multi-game architecture...');

  // 🧹 Nettoyage complet (dev seulement)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning database...');
    const models = [
      'userAchievement', 'notification', 'globalStats', 'achievement', 'word',
      'roomMember', 'gameRoom', 'friendship', 'score', 'gameSession', 
      'gameMode', 'gameType', 'userPreference', 'user'
    ];
    
    for (const model of models) {
      try {
        await prisma[model].deleteMany({});
      } catch (error) {
        console.log(`⚠️  Could not clean ${model}: ${error.message}`);
      }
    }
    console.log('✅ Database cleaned');
  }

  // 👤 Création utilisateurs de test
  console.log('👤 Creating test users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@jeuduclavier.com',
        password: hashedPassword,
        displayName: 'Administrateur',
        isVerified: true,
        status: 'ONLINE',
      },
    }),
    prisma.user.create({
      data: {
        username: 'testplayer',
        email: 'test@example.com',
        password: hashedPassword,
        displayName: 'Joueur Test',
        country: 'FR',
        status: 'ONLINE',
      },
    }),
    prisma.user.create({
      data: {
        username: 'speedtyper',
        email: 'speed@example.com',
        password: hashedPassword,
        displayName: 'Speed Typer',
        country: 'US',
        status: 'AWAY',
      },
    })
  ]);

  // ⚙️ Préférences utilisateurs
  for (const user of users) {
    await prisma.userPreference.create({
      data: {
        userId: user.id,
        defaultLanguage: user.country === 'US' ? 'en' : 'fr',
        theme: 'dark',
        soundEnabled: true,
        animationsEnabled: true,
      },
    });
  }

  console.log(`✅ Created ${users.length} test users`);

  // 🎮 Création des types de jeux et modes
  console.log('🎮 Creating game types and modes...');
  const gameTypes = {};
  
  for (const [typeSlug, typeData] of Object.entries(GAME_TYPES)) {
    const gameType = await prisma.gameType.create({
      data: {
        slug: typeData.slug,
        name: typeData.name,
        description: typeData.description,
        icon: typeData.icon,
        minPlayers: typeData.minPlayers,
        maxPlayers: typeData.maxPlayers,
        settings: typeData.settings,
      },
    });
    
    gameTypes[typeSlug] = gameType;
    
    // Créer les modes pour ce type de jeu
    for (const [modeSlug, modeData] of Object.entries(typeData.modes)) {
      await prisma.gameMode.create({
        data: {
          gameTypeId: gameType.id,
          slug: modeSlug,
          name: modeData.name,
          difficulty: modeData.difficulty,
          settings: modeData.settings,
        },
      });
    }
  }

  console.log(`✅ Created ${Object.keys(GAME_TYPES).length} game types`);

  // 📝 Insertion des mots pour le typing game
  console.log('📝 Inserting words for typing game...');
  const typingGameType = gameTypes.typing;
  let wordsCount = 0;

  for (const [language, difficulties] of Object.entries(TYPING_WORDS)) {
    for (const [difficulty, words] of Object.entries(difficulties)) {
      const difficultyMap = { easy: 1, normal: 3, hard: 6, expert: 8 };
      
      for (const word of words) {
        await prisma.word.create({
          data: {
            gameTypeId: typingGameType.id,
            text: word,
            language,
            difficulty: difficultyMap[difficulty],
            frequency: Math.floor(Math.random() * 10) + 1,
            length: word.length,
            category: difficulty,
          },
        });
        wordsCount++;
      }
    }
  }

  console.log(`✅ Inserted ${wordsCount} words`);

  // 🏅 Création des achievements
  console.log('🏅 Creating achievements...');
  const achievements = {};
  
  for (const achData of ACHIEVEMENTS) {
    const gameTypeId = achData.gameType ? gameTypes[achData.gameType]?.id : null;
    
    const achievement = await prisma.achievement.create({
      data: {
        gameTypeId,
        slug: achData.slug,
        name: achData.name,
        description: achData.description,
        rarity: achData.rarity,
        points: achData.points,
        conditions: {
          // Conditions d'exemple - à adapter selon l'achievement
          target: achData.slug.includes('rookie') ? 10 : achData.slug.includes('master') ? 100 : 1,
          metric: achData.slug.includes('wpm') ? 'wpm' : achData.slug.includes('accuracy') ? 'accuracy' : 'count'
        },
      },
    });
    
    achievements[achData.slug] = achievement;
  }

  console.log(`✅ Created ${ACHIEVEMENTS.length} achievements`);

  // 🏆 Création de scores de test
  console.log('🏆 Creating test scores...');
  const typingModes = await prisma.gameMode.findMany({
    where: { gameTypeId: typingGameType.id }
  });

  const languages = ['fr', 'en', 'es'];
  let scoresCount = 0;

  for (const user of users) {
    for (const mode of typingModes) {
      for (const language of languages) {
        // Créer 3-5 scores par combinaison user/mode/language
        const numScores = Math.floor(Math.random() * 3) + 3;
        
        for (let i = 0; i < numScores; i++) {
          const baseWpm = mode.difficulty * 15 + Math.random() * 20;
          const wpm = Math.floor(baseWpm + (Math.random() * 30 - 15));
          const accuracy = Math.floor(Math.random() * 30 + 70);
          const wordsTyped = Math.floor(Math.random() * 50 + 10);
          const timeElapsed = Math.floor(wordsTyped / (wpm / 60));
          const primaryScore = wordsTyped * (accuracy / 100) * (mode.difficulty + 1);

          await prisma.score.create({
            data: {
              userId: user.id,
              gameTypeId: typingGameType.id,
              gameModeId: mode.id,
              primaryScore: Math.floor(primaryScore),
              secondaryScore: wpm,
              accuracy,
              timeElapsed,
              language,
              metadata: {
                wpm,
                wordsTyped,
                errorsCount: Math.floor(wordsTyped * (1 - accuracy / 100)),
                gameMode: mode.slug
              }
            },
          });
          scoresCount++;
        }
      }
    }
  }

  console.log(`✅ Created ${scoresCount} test scores`);

  // 🎮 Création de sessions de jeu
  console.log('🎮 Creating game sessions...');
  let sessionsCount = 0;

  for (const user of users) {
    // Créer quelques sessions récentes
    for (let i = 0; i < 5; i++) {
      const mode = typingModes[Math.floor(Math.random() * typingModes.length)];
      const language = languages[Math.floor(Math.random() * languages.length)];
      const duration = Math.floor(Math.random() * 300 + 60);
      const wordsTyped = Math.floor(Math.random() * 50 + 10);
      
      const startedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // 7 derniers jours
      const endedAt = new Date(startedAt.getTime() + duration * 1000);

      await prisma.gameSession.create({
        data: {
          userId: user.id,
          gameTypeId: typingGameType.id,
          gameModeId: mode.id,
          status: 'COMPLETED',
          language,
          duration,
          isCompleted: true,
          startedAt,
          endedAt,
          metadata: {
            wordsTyped,
            finalWpm: Math.floor(Math.random() * 60 + 20),
            finalAccuracy: Math.floor(Math.random() * 30 + 70),
            errorsCount: Math.floor(Math.random() * 10)
          }
        },
      });
      sessionsCount++;
    }
  }

  console.log(`✅ Created ${sessionsCount} game sessions`);

  // 👫 Création d'amitiés de test
  console.log('👫 Creating test friendships...');
  await prisma.friendship.create({
    data: {
      requesterId: users[0].id,
      addresseeId: users[1].id,
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
  });

  await prisma.friendship.create({
    data: {
      requesterId: users[1].id,
      addresseeId: users[2].id,
      status: 'PENDING',
    },
  });

  console.log('✅ Created test friendships');

  // 🏠 Création d'une salle multijoueur de test
  console.log('🏠 Creating test game room...');
  const gameRoom = await prisma.gameRoom.create({
    data: {
      name: 'Salle de Test',
      code: 'TEST1234',
      hostId: users[0].id,
      gameTypeId: typingGameType.id,
      gameModeId: typingModes[1].id, // Mode normal
      maxPlayers: 4,
      language: 'fr',
      status: 'WAITING',
      settings: {
        roundTime: 60,
        wordsPerRound: 20,
        allowSpectators: true
      }
    },
  });

  // Ajouter des membres à la salle
  for (let i = 0; i < 2; i++) {
    await prisma.roomMember.create({
      data: {
        roomId: gameRoom.id,
        userId: users[i].id,
        status: i === 0 ? 'READY' : 'JOINED',
        isReady: i === 0,
        position: i + 1,
      },
    });
  }

  console.log('✅ Created test game room');

  // 🏅 Attribution d'achievements de test
  console.log('🏅 Assigning test achievements...');
  await prisma.userAchievement.create({
    data: {
      userId: users[0].id,
      achievementId: achievements.first_game.id,
      progress: { completed: true }
    },
  });

  await prisma.userAchievement.create({
    data: {
      userId: users[1].id,
      achievementId: achievements.typing_rookie.id,
      progress: { gamesPlayed: 15, target: 10, completed: true }
    },
  });

  console.log('✅ Assigned test achievements');

  // 🔔 Création de notifications de test
  console.log('🔔 Creating test notifications...');
  await prisma.notification.create({
    data: {
      userId: users[1].id,
      type: 'FRIEND_REQUEST',
      title: 'Nouvelle demande d\'ami',
      message: `${users[2].displayName} souhaite être votre ami`,
      data: { requesterId: users[2].id }
    },
  });

  await prisma.notification.create({
    data: {
      userId: users[0].id,
      type: 'ACHIEVEMENT_UNLOCKED',
      title: 'Achievement débloqué !',
      message: 'Vous avez débloqué "Premier Pas"',
      data: { achievementId: achievements.first_game.id },
      isRead: true,
      readAt: new Date()
    },
  });

  console.log('✅ Created test notifications');

  // 📊 Mise à jour des statistiques globales
  console.log('📊 Updating global statistics...');
  for (const mode of typingModes) {
    for (const language of languages) {
      const scores = await prisma.score.findMany({
        where: {
          gameModeId: mode.id,
          language
        }
      });

      if (scores.length > 0) {
        const averageScore = scores.reduce((sum, score) => sum + score.primaryScore, 0) / scores.length;
        const topScore = Math.max(...scores.map(score => score.primaryScore));
        const uniquePlayers = new Set(scores.map(score => score.userId)).size;

        await prisma.globalStats.create({
          data: {
            gameTypeId: typingGameType.id,
            gameModeId: mode.id,
            language,
            totalGames: scores.length,
            totalPlayers: uniquePlayers,
            averageScore,
            topScore,
            metadata: {
              averageWpm: scores.reduce((sum, score) => sum + (score.secondaryScore || 0), 0) / scores.length,
              averageAccuracy: scores.reduce((sum, score) => sum + (score.accuracy || 0), 0) / scores.length,
              totalWordsTyped: scores.reduce((sum, score) => sum + (score.metadata?.wordsTyped || 0), 0)
            }
          },
        });
      }
    }
  }

  console.log('✅ Updated global statistics');

  // 🏆 Marquage des personal bests
  console.log('🏆 Marking personal bests...');
  for (const user of users) {
    for (const mode of typingModes) {
      for (const language of languages) {
        const bestScore = await prisma.score.findFirst({
          where: {
            userId: user.id,
            gameModeId: mode.id,
            language
          },
          orderBy: {
            primaryScore: 'desc'
          }
        });

        if (bestScore) {
          await prisma.score.update({
            where: { id: bestScore.id },
            data: { isPersonalBest: true }
          });
        }
      }
    }
  }

  console.log('✅ Marked personal bests');

  // 📈 Résumé final
  const finalStats = {
    users: await prisma.user.count(),
    gameTypes: await prisma.gameType.count(),
    gameModes: await prisma.gameMode.count(),
    words: await prisma.word.count(),
    scores: await prisma.score.count(),
    achievements: await prisma.achievement.count(),
    gameRooms: await prisma.gameRoom.count(),
    notifications: await prisma.notification.count()
  };

  console.log('\n🎉 Database seed completed successfully!');
  console.log('📊 Final statistics:');
  console.log(`   👤 Users: ${finalStats.users}`);
  console.log(`   🎮 Game Types: ${finalStats.gameTypes}`);
  console.log(`   🎯 Game Modes: ${finalStats.gameModes}`);
  console.log(`   📝 Words: ${finalStats.words}`);
  console.log(`   🏆 Scores: ${finalStats.scores}`);
  console.log(`   🏅 Achievements: ${finalStats.achievements}`);
  console.log(`   🏠 Game Rooms: ${finalStats.gameRooms}`);
  console.log(`   🔔 Notifications: ${finalStats.notifications}`);
  console.log('\n✨ Ready for multi-game, multiplayer, and future expansions!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
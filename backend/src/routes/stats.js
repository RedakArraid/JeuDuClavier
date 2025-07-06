import express from 'express';

const router = express.Router();

// Storage pour les statistiques globales
let globalStats = {
  totalGames: 0,
  totalWords: 0,
  totalTime: 0,
  averageWPM: 0,
  averageAccuracy: 0,
  difficultyStats: {
    easy: { games: 0, averageScore: 0 },
    normal: { games: 0, averageScore: 0 },
    hard: { games: 0, averageScore: 0 },
    expert: { games: 0, averageScore: 0 }
  }
};

// GET /api/stats/global - Statistiques globales
router.get('/global', (req, res) => {
  res.json(globalStats);
});

// POST /api/stats/game - Enregistrer les stats d'une partie
router.post('/game', (req, res) => {
  const { 
    difficulty, 
    score, 
    wpm, 
    accuracy, 
    wordsTyped, 
    timeElapsed 
  } = req.body;
  
  // Validation basique
  if (!difficulty || score === undefined || wpm === undefined) {
    return res.status(400).json({ 
      error: 'Missing required fields' 
    });
  }
  
  // Mettre à jour les stats globales
  globalStats.totalGames++;
  globalStats.totalWords += wordsTyped || 0;
  globalStats.totalTime += timeElapsed || 0;
  
  // Recalculer les moyennes
  globalStats.averageWPM = globalStats.totalWords > 0 
    ? (globalStats.totalWords / globalStats.totalTime) * 60 
    : 0;
  
  // Mettre à jour les stats par difficulté
  if (globalStats.difficultyStats[difficulty]) {
    const diffStat = globalStats.difficultyStats[difficulty];
    const newAverage = (diffStat.averageScore * diffStat.games + score) / (diffStat.games + 1);
    
    diffStat.games++;
    diffStat.averageScore = newAverage;
  }
  
  res.json({ 
    message: 'Game stats recorded',
    globalStats 
  });
});

// GET /api/stats/leaderboard-summary - Résumé du classement
router.get('/leaderboard-summary', (req, res) => {
  // Simuler des données de classement (en production, récupérer depuis les scores)
  const summary = {
    topPlayer: {
      name: "Champion",
      score: 15000,
      wpm: 85
    },
    totalPlayers: globalStats.totalGames,
    averageWPM: Math.round(globalStats.averageWPM),
    mostPopularDifficulty: Object.entries(globalStats.difficultyStats)
      .reduce((a, b) => a[1].games > b[1].games ? a : b)[0]
  };
  
  res.json(summary);
});

// GET /api/stats/performance/:difficulty - Stats de performance par difficulté
router.get('/performance/:difficulty', (req, res) => {
  const { difficulty } = req.params;
  
  if (!globalStats.difficultyStats[difficulty]) {
    return res.status(400).json({ 
      error: 'Invalid difficulty' 
    });
  }
  
  const performance = {
    difficulty,
    ...globalStats.difficultyStats[difficulty],
    recommendations: getRecommendations(difficulty)
  };
  
  res.json(performance);
});

// Fonction utilitaire pour les recommandations
function getRecommendations(difficulty) {
  const recommendations = {
    easy: [
      "Focus on accuracy over speed",
      "Practice common 3-letter words",
      "Keep your hands positioned correctly"
    ],
    normal: [
      "Work on typing rhythm",
      "Practice word recognition",
      "Increase typing speed gradually"
    ],
    hard: [
      "Master complex word patterns",
      "Improve muscle memory",
      "Practice touch typing"
    ],
    expert: [
      "Perfect your technique",
      "Work on rapid word recognition",
      "Master advanced typing patterns"
    ]
  };
  
  return recommendations[difficulty] || [];
}

// DELETE /api/stats/reset - Reset des statistiques (admin)
router.delete('/reset', (req, res) => {
  globalStats = {
    totalGames: 0,
    totalWords: 0,
    totalTime: 0,
    averageWPM: 0,
    averageAccuracy: 0,
    difficultyStats: {
      easy: { games: 0, averageScore: 0 },
      normal: { games: 0, averageScore: 0 },
      hard: { games: 0, averageScore: 0 },
      expert: { games: 0, averageScore: 0 }
    }
  };
  
  res.json({ 
    message: 'Global stats reset successfully' 
  });
});

export default router;

// backend/src/routes/databaseWords.js
// 🎮 Routes API pour récupérer les mots depuis la BDD

import express from 'express';
import shuffledWordService from '../services/shuffledWordService.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const gameWordSchema = Joi.object({
  difficulty: Joi.string().valid('easy', 'normal', 'hard', 'expert').required(),
  language: Joi.string().valid('fr', 'en').default('fr'),
  level: Joi.number().integer().min(1).max(100).default(1)
});

// GET /api/game-words/next - Prochain mot de la liste mélangée
router.get('/next', async (req, res) => {
  try {
    const { error, value } = gameWordSchema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        error: 'Paramètres invalides',
        details: error.details[0].message
      });
    }

    const { difficulty, language, level } = value;
    
    const word = await shuffledWordService.getNextWord(difficulty, language, level);
    
    if (!word) {
      return res.status(404).json({
        error: 'Aucun mot trouvé',
        difficulty,
        language,
        level
      });
    }

    res.json({
      success: true,
      word: word.text,
      length: word.length,
      difficulty: word.difficulty,
      frequency: word.frequency,
      meta: {
        requestedDifficulty: difficulty,
        language,
        level
      }
    });

  } catch (error) {
    console.error('Erreur /next:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

// GET /api/game-words/batch - Plusieurs mots d'un coup
router.get('/batch', async (req, res) => {
  try {
    const schema = gameWordSchema.keys({
      count: Joi.number().integer().min(1).max(50).default(10)
    });

    const { error, value } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        error: 'Paramètres invalides',
        details: error.details[0].message
      });
    }

    const { difficulty, language, level, count } = value;
    
    const words = [];
    for (let i = 0; i < count; i++) {
      const word = await randomWordService.getRandomWord(difficulty, language, level);
      if (word) {
        words.push({
          text: word.text,
          length: word.length,
          difficulty: word.difficulty
        });
      }
    }

    res.json({
      success: true,
      words,
      count: words.length,
      meta: {
        requestedDifficulty: difficulty,
        language,
        level
      }
    });

  } catch (error) {
    console.error('Erreur /batch:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

// POST /api/game-words/restart - Redémarrer une partie (re-mélanger)
router.post('/restart', async (req, res) => {
  try {
    const { error, value } = gameWordSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Paramètres invalides',
        details: error.details[0].message
      });
    }

    const { difficulty, language, level } = value;
    
    await shuffledWordService.restartGame(difficulty, language, level);
    
    res.json({
      success: true,
      message: 'Partie redémarrée, liste re-mélangée',
      difficulty,
      language,
      level
    });

  } catch (error) {
    console.error('Erreur /restart:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

// GET /api/game-words/stats - Statistiques de la liste actuelle
router.get('/list-stats', async (req, res) => {
  try {
    const { difficulty = 'normal', language = 'fr', level = 1 } = req.query;
    
    const stats = shuffledWordService.getListStats(difficulty, language, parseInt(level));
    
    res.json({
      success: true,
      stats,
      difficulty,
      language,
      level: parseInt(level)
    });

  } catch (error) {
    console.error('Erreur /list-stats:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

// POST /api/game-words/clear-cache - Pas de cache dans le service aléatoire
router.post('/clear-cache', (req, res) => {
  res.json({
    success: true,
    message: 'Service aléatoire - pas de cache à nettoyer'
  });
});

// GET /api/game-words/test - Tester la randomisation
router.get('/test', async (req, res) => {
  try {
    const { difficulty = 'normal', language = 'fr', count = 10 } = req.query;
    
    const testResults = await randomWordService.testRandomness(
      difficulty, 
      language, 
      parseInt(count)
    );
    
    res.json({
      success: true,
      ...testResults
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur test randomisation',
      message: error.message
    });
  }
});

export default router;
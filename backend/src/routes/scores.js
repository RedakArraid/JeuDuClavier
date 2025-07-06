import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';

const router = express.Router();

// In-memory storage (remplacer par une vraie DB en production)
let scores = [];

// Validation schema
const scoreSchema = Joi.object({
  playerName: Joi.string().min(1).max(50).required(),
  score: Joi.number().integer().min(0).required(),
  wpm: Joi.number().min(0).required(),
  accuracy: Joi.number().min(0).max(100).required(),
  level: Joi.number().integer().min(1).required(),
  difficulty: Joi.string().valid('easy', 'normal', 'hard', 'expert').required(),
  wordsTyped: Joi.number().integer().min(0).required(),
  timeElapsed: Joi.number().min(0).required()
});

// GET /api/scores - Récupérer tous les scores
router.get('/', (req, res) => {
  const { difficulty, limit = 10 } = req.query;
  
  let filteredScores = scores;
  
  if (difficulty) {
    filteredScores = scores.filter(s => s.difficulty === difficulty);
  }
  
  // Trier par score décroissant
  filteredScores.sort((a, b) => b.score - a.score);
  
  // Limiter les résultats
  const limitedScores = filteredScores.slice(0, parseInt(limit));
  
  res.json({
    scores: limitedScores,
    total: filteredScores.length
  });
});

// POST /api/scores - Sauvegarder un nouveau score
router.post('/', (req, res) => {
  const { error, value } = scoreSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details[0].message
    });
  }
  
  const newScore = {
    id: uuidv4(),
    ...value,
    timestamp: new Date().toISOString()
  };
  
  scores.push(newScore);
  
  // Garder seulement les 1000 meilleurs scores
  if (scores.length > 1000) {
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 1000);
  }
  
  res.status(201).json({
    message: 'Score saved successfully',
    score: newScore
  });
});

// GET /api/scores/leaderboard - Classement par difficulté
router.get('/leaderboard', (req, res) => {
  const leaderboards = {};
  
  ['easy', 'normal', 'hard', 'expert'].forEach(difficulty => {
    const difficultyScores = scores
      .filter(s => s.difficulty === difficulty)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    leaderboards[difficulty] = difficultyScores;
  });
  
  res.json(leaderboards);
});

// DELETE /api/scores/:id - Supprimer un score (admin)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = scores.length;
  
  scores = scores.filter(s => s.id !== id);
  
  if (scores.length === initialLength) {
    return res.status(404).json({ error: 'Score not found' });
  }
  
  res.json({ message: 'Score deleted successfully' });
});

export default router;

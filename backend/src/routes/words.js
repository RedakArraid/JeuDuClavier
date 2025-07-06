import express from 'express';

const router = express.Router();

// Listes de mots par difficulté
const wordLists = {
  easy: [
    'cat', 'dog', 'sun', 'run', 'fun', 'car', 'eat', 'red', 'big', 'yes',
    'no', 'go', 'up', 'me', 'we', 'he', 'she', 'can', 'see', 'the',
    'and', 'you', 'are', 'not', 'but', 'was', 'his', 'her', 'him', 'joy',
    'love', 'hope', 'book', 'tree', 'blue', 'fast', 'slow', 'open', 'play'
  ],
  normal: [
    'house', 'water', 'light', 'world', 'music', 'dance', 'smile', 'dream',
    'story', 'peace', 'happy', 'friend', 'family', 'nature', 'flower',
    'mountain', 'ocean', 'forest', 'animal', 'planet', 'future', 'memory',
    'journey', 'freedom', 'courage', 'wisdom', 'beauty', 'energy', 'wonder',
    'creative', 'amazing', 'brilliant', 'fantastic', 'wonderful', 'powerful'
  ],
  hard: [
    'technology', 'development', 'programming', 'algorithm', 'architecture',
    'psychology', 'philosophy', 'communication', 'international', 'organization',
    'responsibility', 'understanding', 'opportunities', 'achievements', 'imagination',
    'extraordinary', 'professional', 'transformation', 'collaboration', 'investigation',
    'determination', 'concentration', 'representation', 'administration', 'configuration',
    'sophisticated', 'revolutionary', 'environmental', 'psychological', 'technological'
  ],
  expert: [
    'implementation', 'synchronization', 'authentication', 'optimization',
    'characteristics', 'responsibilities', 'recommendations', 'specifications',
    'infrastructure', 'documentation', 'internationalization', 'troubleshooting',
    'acknowledgment', 'accomplishment', 'comprehensive', 'unprecedented',
    'revolutionary', 'extraordinary', 'sophisticated', 'breakthrough',
    'incomprehensible', 'supercalifragilisticexpialidocious', 'pneumonoultramicroscopicsilicovolcanoconiosis'
  ]
};

// GET /api/words/:difficulty - Récupérer des mots par difficulté
router.get('/:difficulty', (req, res) => {
  const { difficulty } = req.params;
  const { count = 10 } = req.query;
  
  if (!wordLists[difficulty]) {
    return res.status(400).json({ 
      error: 'Invalid difficulty', 
      valid: Object.keys(wordLists) 
    });
  }
  
  const words = wordLists[difficulty];
  const requestedCount = parseInt(count);
  
  if (requestedCount > words.length) {
    return res.status(400).json({ 
      error: 'Requested count exceeds available words',
      available: words.length 
    });
  }
  
  // Sélectionner des mots aléatoires
  const shuffled = [...words].sort(() => 0.5 - Math.random());
  const selectedWords = shuffled.slice(0, requestedCount);
  
  res.json({
    difficulty,
    words: selectedWords,
    count: selectedWords.length
  });
});

// GET /api/words/random/:difficulty - Récupérer un mot aléatoire
router.get('/random/:difficulty', (req, res) => {
  const { difficulty } = req.params;
  
  if (!wordLists[difficulty]) {
    return res.status(400).json({ 
      error: 'Invalid difficulty', 
      valid: Object.keys(wordLists) 
    });
  }
  
  const words = wordLists[difficulty];
  const randomWord = words[Math.floor(Math.random() * words.length)];
  
  res.json({
    difficulty,
    word: randomWord
  });
});

// GET /api/words/stats - Statistiques des mots
router.get('/stats', (req, res) => {
  const stats = {};
  
  Object.keys(wordLists).forEach(difficulty => {
    const words = wordLists[difficulty];
    const lengths = words.map(w => w.length);
    
    stats[difficulty] = {
      count: words.length,
      averageLength: lengths.reduce((a, b) => a + b, 0) / lengths.length,
      minLength: Math.min(...lengths),
      maxLength: Math.max(...lengths)
    };
  });
  
  res.json(stats);
});

// POST /api/words/validate - Valider un mot
router.post('/validate', (req, res) => {
  const { word, difficulty } = req.body;
  
  if (!word || !difficulty) {
    return res.status(400).json({ 
      error: 'Word and difficulty are required' 
    });
  }
  
  if (!wordLists[difficulty]) {
    return res.status(400).json({ 
      error: 'Invalid difficulty' 
    });
  }
  
  const isValid = wordLists[difficulty].includes(word.toLowerCase());
  
  res.json({
    word,
    difficulty,
    isValid
  });
});

export default router;

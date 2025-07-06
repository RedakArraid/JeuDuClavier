import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, FallingWord, DifficultyLevel, GameConfig } from '../types/game';
import { getRandomWord, reverseWord } from '../data/words';

// Configuration adaptée à la nouvelle hauteur du cadre (85vh au lieu de 70vh)
const GAME_CONFIG: Record<DifficultyLevel, GameConfig> = {
  easy: { wordSpeed: 0.6, spawnRate: 0, maxWords: 1, reverseWords: false },
  normal: { wordSpeed: 0.8, spawnRate: 0, maxWords: 1, reverseWords: false },
  hard: { wordSpeed: 1.0, spawnRate: 0, maxWords: 1, reverseWords: false },
  expert: { wordSpeed: 1.2, spawnRate: 0, maxWords: 1, reverseWords: true }
};

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    difficulty: 'easy',
    stats: {
      score: 0,
      wpm: 0,
      accuracy: 100,
      level: 1,
      wordsTyped: 0,
      errorsCount: 0,
      timeElapsed: 0
    },
    fallingWords: [],
    currentInput: '',
    activeWordId: null,
    gameStartTime: 0
  });

  const gameLoopRef = useRef<number>();
  const originalWordRef = useRef<string>('');
  const shouldSpawnRef = useRef<boolean>(false);

  const createFallingWord = useCallback((difficulty: DifficultyLevel): FallingWord => {
    const config = GAME_CONFIG[difficulty];
    let word = getRandomWord(difficulty);
    
    if (config.reverseWords) {
      word = reverseWord(word);
    }

    // Sauvegarder le mot original
    originalWordRef.current = word;
    console.log('🎯 Création du mot:', word, 'Vitesse:', config.wordSpeed, '(Cadre étendu)');

    return {
      id: Math.random().toString(36).substring(2, 11),
      text: word,
      x: 50, // Position centrée fixe
      y: 3, // Position plus haute dans le cadre étendu
      speed: config.wordSpeed,
      typed: '',
      isComplete: false,
      isActive: true
    };
  }, []);

  const updateWordPositions = useCallback(() => {
    setGameState(prev => {
      if (!prev.isPlaying || prev.isPaused) return prev;
      if (prev.fallingWords.length === 0) return prev;
      
      const currentWord = prev.fallingWords[0];
      const newY = currentWord.y + currentWord.speed;
      
      console.log(`📍 Mot "${currentWord.text}" - Position: y=${currentWord.y.toFixed(1)} → y=${newY.toFixed(1)} (cadre étendu)`);
      
      // Seuil de Game Over adapté au cadre plus haut (92% au lieu de 85%)
      if (newY > 92) {
        console.log('💀 GAME OVER - Mot sorti du cadre étendu:', currentWord.text, 'à y=', newY.toFixed(1));
        return {
          ...prev,
          isPlaying: false,
          isGameOver: true,
          fallingWords: [],
          stats: {
            ...prev.stats,
            errorsCount: prev.stats.errorsCount + 1
          }
        };
      }
      
      // Mettre à jour la position
      const updatedWords = [{
        ...currentWord,
        y: newY
      }];
      
      const timeElapsed = prev.gameStartTime > 0 
        ? Math.round((Date.now() - prev.gameStartTime) / 1000)
        : 0;
      
      return {
        ...prev,
        fallingWords: updatedWords,
        stats: {
          ...prev.stats,
          timeElapsed
        }
      };
    });
  }, []);

  const handleInput = useCallback((input: string) => {
    console.log('🔤 Saisie reçue:', input);
    
    setGameState(prev => {
      if (prev.fallingWords.length === 0) {
        console.log('❌ Pas de mot actuel');
        return { ...prev, currentInput: input };
      }
      
      const currentWord = prev.fallingWords[0];
      const originalWord = originalWordRef.current;
      
      console.log(`🎯 Vérification: saisie="${input}" vs mot="${currentWord.text}" (position y=${currentWord.y.toFixed(1)})`);
      
      // Vérifier si la saisie correspond exactement aux premières lettres du mot restant
      if (currentWord.text.toLowerCase().startsWith(input.toLowerCase())) {
        console.log('✅ Saisie correcte!');
        
        // Calculer la partie restante
        const remainingText = currentWord.text.substring(input.length);
        console.log(`📝 Reste à taper: "${remainingText}"`);
        
        // Mot complètement tapé
        if (remainingText === '') {
          console.log('🎉 Mot complété:', originalWord, 'à la position y=', currentWord.y.toFixed(1));
          
          // Calculer les stats
          const timeElapsed = prev.gameStartTime > 0 
            ? (Date.now() - prev.gameStartTime) / 1000
            : 1;
          
          const wordsTyped = prev.stats.wordsTyped + 1;
          const wpm = timeElapsed > 0 ? Math.round((wordsTyped / timeElapsed) * 60) : 0;
          
          // Bonus si complété tôt dans le cadre étendu
          let bonus = 0;
          if (currentWord.y < 30) bonus = 50; // Bonus haut du cadre
          else if (currentWord.y < 60) bonus = 25; // Bonus milieu du cadre
          
          console.log('🎁 Bonus position:', bonus, 'points (y=', currentWord.y.toFixed(1), ')');
          
          // Marquer qu'il faut spawner un nouveau mot
          shouldSpawnRef.current = true;
          
          return {
            ...prev,
            fallingWords: [], // Supprimer le mot complété
            currentInput: '',
            stats: {
              ...prev.stats,
              score: prev.stats.score + originalWord.length * 10 + bonus,
              wordsTyped,
              wpm,
              accuracy: 100,
              level: Math.floor(wordsTyped / 10) + 1,
              timeElapsed: Math.round(timeElapsed)
            }
          };
        }
        
        // Mettre à jour le mot avec la partie restante
        const updatedWord = {
          ...currentWord,
          text: remainingText,
          typed: input
        };
        
        return {
          ...prev,
          fallingWords: [updatedWord],
          currentInput: input
        };
      } else {
        // Saisie incorrecte - on garde juste l'input pour l'affichage
        console.log('❌ Saisie incorrecte');
        return {
          ...prev,
          currentInput: input
        };
      }
    });
  }, []);

  const spawnNextWord = useCallback(() => {
    if (!shouldSpawnRef.current) return;
    
    setGameState(prev => {
      if (!prev.isPlaying || prev.isPaused) return prev;
      if (prev.fallingWords.length > 0) return prev; // Déjà un mot
      
      const newWord = createFallingWord(prev.difficulty);
      console.log('🆕 Nouveau mot spawné dans cadre étendu:', newWord.text, 'vitesse:', newWord.speed, 'position y:', newWord.y);
      shouldSpawnRef.current = false;
      
      return {
        ...prev,
        fallingWords: [newWord],
        currentInput: ''
      };
    });
  }, [createFallingWord]);

  const startGame = useCallback((difficulty: DifficultyLevel) => {
    console.log('🚀 Démarrage - Cadre étendu (85vh) - Difficulté:', difficulty, 'Vitesse:', GAME_CONFIG[difficulty].wordSpeed);
    
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    originalWordRef.current = '';
    shouldSpawnRef.current = true; // Marquer pour spawner le premier mot
    
    setGameState({
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      difficulty,
      gameStartTime: Date.now(),
      fallingWords: [],
      currentInput: '',
      activeWordId: null,
      stats: {
        score: 0,
        wpm: 0,
        accuracy: 100,
        level: 1,
        wordsTyped: 0,
        errorsCount: 0,
        timeElapsed: 0
      }
    });
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const stopGame = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    shouldSpawnRef.current = false;
    
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      isGameOver: true
    }));
  }, []);

  const resetGame = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    originalWordRef.current = '';
    shouldSpawnRef.current = false;
    
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      isGameOver: false,
      fallingWords: [],
      currentInput: '',
      activeWordId: null,
      stats: {
        score: 0,
        wpm: 0,
        accuracy: 100,
        level: 1,
        wordsTyped: 0,
        errorsCount: 0,
        timeElapsed: 0
      }
    }));
  }, []);

  // Boucle de jeu pour le mouvement
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      const gameLoop = () => {
        updateWordPositions();
        if (gameState.isPlaying && !gameState.isPaused) {
          gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
      };
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, updateWordPositions]);

  // Effet pour spawner des mots quand nécessaire
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && shouldSpawnRef.current) {
      const timer = setTimeout(() => {
        spawnNextWord();
      }, 1000); // Délai légèrement plus long pour profiter du cadre étendu
      
      return () => clearTimeout(timer);
    }
  }, [gameState.isPlaying, gameState.isPaused, gameState.fallingWords.length, spawnNextWord]);

  return {
    gameState,
    startGame,
    pauseGame,
    stopGame,
    resetGame,
    handleInput
  };
};

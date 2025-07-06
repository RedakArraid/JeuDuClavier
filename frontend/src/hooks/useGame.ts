import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, FallingWord, DifficultyLevel, GameConfig } from '../types/game';
import { getRandomWord, reverseWord } from '../data/words';

const GAME_CONFIG: Record<DifficultyLevel, GameConfig> = {
  easy: { wordSpeed: 0.3, spawnRate: 0, maxWords: 1, reverseWords: false },
  normal: { wordSpeed: 0.3, spawnRate: 0, maxWords: 1, reverseWords: false },
  hard: { wordSpeed: 0.3, spawnRate: 0, maxWords: 1, reverseWords: false },
  expert: { wordSpeed: 0.3, spawnRate: 0, maxWords: 1, reverseWords: true }
};

// Configuration de l'augmentation de vitesse par difficulté
const SPEED_PROGRESSION: Record<DifficultyLevel, { interval: number; increment: number }> = {
  easy: { interval: 10, increment: 0.1 },    // +0.1 chaque 10 mots
  normal: { interval: 5, increment: 0.1 },   // +0.1 chaque 5 mots
  hard: { interval: 5, increment: 0.1 },     // +0.1 chaque 5 mots
  expert: { interval: 10, increment: 0.1 }   // +0.1 chaque 10 mots
};

// Fonction pour calculer la vitesse actuelle basée sur les mots tapés
const calculateWordSpeed = (difficulty: DifficultyLevel, wordsTyped: number): number => {
  const baseSpeed = GAME_CONFIG[difficulty].wordSpeed;
  const progression = SPEED_PROGRESSION[difficulty];
  const speedIncrements = Math.floor(wordsTyped / progression.interval);
  return baseSpeed + (speedIncrements * progression.increment);
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
      timeElapsed: 0,
      currentSpeed: 0.3
    },
    fallingWords: [],
    currentInput: '',
    activeWordId: null,
    gameStartTime: 0
  });

  const gameLoopRef = useRef<number>();
  const originalWordRef = useRef<string>('');
  const currentTypedRef = useRef<string>('');
  const shouldSpawnRef = useRef<boolean>(false);

  const createFallingWord = useCallback((difficulty: DifficultyLevel, wordsTyped: number = 0): FallingWord => {
    const config = GAME_CONFIG[difficulty];
    let word = getRandomWord(difficulty);
    
    // Pour le mode expert, on garde le mot normal (pas inversé)
    // La logique d'inversion sera gérée dans la saisie
    
    originalWordRef.current = word;
    currentTypedRef.current = '';

    // Calculer la vitesse basée sur le nombre de mots tapés
    const currentSpeed = calculateWordSpeed(difficulty, wordsTyped);

    return {
      id: Math.random().toString(36).substring(2, 11),
      text: word,
      x: 50,
      y: 3,
      speed: currentSpeed,
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
      
      // Game Over si le mot tombe trop bas
      if (newY > 92) {
        console.log('💀 GAME OVER - Mot tombé trop bas:', currentWord.text, 'Y:', newY);
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

  // Gestion d'une touche pressée
  const handleKeyPress = useCallback((key: string) => {
    // Vérifications préliminaires
    if (gameState.fallingWords.length === 0) {
      return;
    }
    
    const originalWord = originalWordRef.current;
    const currentTyped = currentTypedRef.current;
    const isExpertMode = gameState.difficulty === 'expert';
    
    let isValidKey = false;
    let newTyped = '';
    
    if (isExpertMode) {
      // Mode expert : saisie de droite à gauche
      const expectedIndex = originalWord.length - 1 - currentTyped.length;
      const expectedChar = originalWord[expectedIndex];
      
      if (key.toLowerCase() === expectedChar.toLowerCase()) {
        isValidKey = true;
        newTyped = currentTyped + key;
      }
    } else {
      // Modes normaux : saisie de gauche à droite
      newTyped = currentTyped + key;
      isValidKey = originalWord.toLowerCase().startsWith(newTyped.toLowerCase());
    }
    
    if (isValidKey) {
      // Mettre à jour la ref immédiatement
      currentTypedRef.current = newTyped;
      
      // Calculer le texte restant pour l'affichage
      let remainingText = '';
      if (isExpertMode) {
        // En mode expert, on retire les lettres par la droite
        remainingText = originalWord.substring(0, originalWord.length - newTyped.length);
      } else {
        // En mode normal, on retire les lettres par la gauche
        remainingText = originalWord.substring(newTyped.length);
      }
      
      // Mot complètement tapé
      if (remainingText === '') {
        // Reset pour le prochain mot
        currentTypedRef.current = '';
        originalWordRef.current = '';
        shouldSpawnRef.current = true;
        
        setGameState(prev => {
          const timeElapsed = prev.gameStartTime > 0 
            ? (Date.now() - prev.gameStartTime) / 1000
            : 1;
          
          const wordsTyped = prev.stats.wordsTyped + 1;
          const wpm = timeElapsed > 0 ? Math.round((wordsTyped / timeElapsed) * 60) : 0;
          
          // Bonus de position
          const currentWord = prev.fallingWords[0];
          let bonus = 0;
          if (currentWord.y < 30) bonus = 50;
          else if (currentWord.y < 60) bonus = 25;
          
          // Calculer la nouvelle vitesse pour le prochain mot
          const currentSpeed = calculateWordSpeed(prev.difficulty, wordsTyped);
          
          return {
            ...prev,
            fallingWords: [],
            currentInput: '',
            stats: {
              ...prev.stats,
              score: prev.stats.score + originalWord.length * 10 + bonus,
              wordsTyped,
              wpm,
              accuracy: 100,
              level: Math.floor(wordsTyped / 10) + 1,
              timeElapsed: Math.round(timeElapsed),
              currentSpeed
            }
          };
        });
      } else {
        // Mettre à jour le mot avec la partie restante
        setGameState(prev => {
          const currentWord = prev.fallingWords[0];
          const updatedWord = {
            ...currentWord,
            text: remainingText,
            typed: newTyped
          };
          
          return {
            ...prev,
            fallingWords: [updatedWord],
            currentInput: newTyped
          };
        });
      }
    } else {
      // Lettre incorrecte
      setGameState(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          errorsCount: prev.stats.errorsCount + 1,
          accuracy: Math.round(((prev.stats.wordsTyped * 5) / Math.max(1, prev.stats.wordsTyped * 5 + prev.stats.errorsCount + 1)) * 100)
        }
      }));
    }
  }, [gameState.fallingWords.length, gameState.difficulty]);

  // Gestion de la touche Backspace
  const handleBackspace = useCallback(() => {
    setGameState(prev => {
      if (prev.fallingWords.length === 0 || currentTypedRef.current === '') {
        return prev;
      }
      
      // Retirer la dernière lettre tapée
      const newTyped = currentTypedRef.current.slice(0, -1);
      currentTypedRef.current = newTyped;
      
      const originalWord = originalWordRef.current;
      const isExpertMode = prev.difficulty === 'expert';
      
      // Calculer le texte restant pour l'affichage
      let remainingText = '';
      if (isExpertMode) {
        // En mode expert, on remet les lettres par la droite
        remainingText = originalWord.substring(0, originalWord.length - newTyped.length);
      } else {
        // En mode normal, on remet les lettres par la gauche
        remainingText = originalWord.substring(newTyped.length);
      }
      
      // Mettre à jour le mot affiché
      const currentWord = prev.fallingWords[0];
      const updatedWord = {
        ...currentWord,
        text: remainingText,
        typed: newTyped
      };
      
      return {
        ...prev,
        fallingWords: [updatedWord],
        currentInput: newTyped
      };
    });
  }, []);

  const spawnNextWord = useCallback(() => {
    if (!shouldSpawnRef.current) {
      return;
    }
    
    setGameState(prev => {
      if (!prev.isPlaying || prev.isPaused) {
        return prev;
      }
      if (prev.fallingWords.length > 0) {
        return prev;
      }
      
      // Passer le nombre de mots tapés pour calculer la vitesse
      const newWord = createFallingWord(prev.difficulty, prev.stats.wordsTyped);
      shouldSpawnRef.current = false;
      
      return {
        ...prev,
        fallingWords: [newWord],
        currentInput: ''
      };
    });
  }, [createFallingWord]);

  const startGame = useCallback((difficulty: DifficultyLevel) => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    // Reset complet
    originalWordRef.current = '';
    currentTypedRef.current = '';
    shouldSpawnRef.current = true;
    
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
        timeElapsed: 0,
        currentSpeed: 0.3
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
    currentTypedRef.current = '';
    
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
    currentTypedRef.current = '';
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
        timeElapsed: 0,
        currentSpeed: 0.3
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

  // Spawner des mots quand nécessaire
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && shouldSpawnRef.current) {
      const timer = setTimeout(() => {
        spawnNextWord();
      }, 1000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [gameState.isPlaying, gameState.isPaused, gameState.fallingWords.length, spawnNextWord]);

  return {
    gameState,
    startGame,
    pauseGame,
    stopGame,
    resetGame,
    handleKeyPress,
    handleBackspace
  };
};

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, FallingWord, DifficultyLevel, GameConfig } from '../types/game';
import { getRandomWord, reverseWord } from '../data/words';

const GAME_CONFIG: Record<DifficultyLevel, GameConfig> = {
  easy: { wordSpeed: 1, spawnRate: 3000, maxWords: 3, reverseWords: false },
  normal: { wordSpeed: 1.5, spawnRate: 2500, maxWords: 4, reverseWords: false },
  hard: { wordSpeed: 2, spawnRate: 2000, maxWords: 5, reverseWords: false },
  expert: { wordSpeed: 2.5, spawnRate: 1800, maxWords: 6, reverseWords: true }
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
      accuracy: 0,
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
  const spawnTimerRef = useRef<NodeJS.Timeout>();

  const createFallingWord = useCallback((difficulty: DifficultyLevel): FallingWord => {
    const config = GAME_CONFIG[difficulty];
    let word = getRandomWord(difficulty);
    
    if (config.reverseWords) {
      word = reverseWord(word);
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      text: word,
      x: Math.random() * 80 + 10, // 10% to 90% of screen width
      y: 0,
      speed: config.wordSpeed,
      typed: '',
      isComplete: false,
      isActive: false
    };
  }, []);

  const spawnWord = useCallback(() => {
    setGameState(prev => {
      const config = GAME_CONFIG[prev.difficulty];
      if (prev.fallingWords.length >= config.maxWords) return prev;

      const newWord = createFallingWord(prev.difficulty);
      return {
        ...prev,
        fallingWords: [...prev.fallingWords, newWord]
      };
    });
  }, [createFallingWord]);

  const updateWordPositions = useCallback(() => {
    setGameState(prev => {
      if (!prev.isPlaying || prev.isPaused) return prev;
      
      const updatedWords = prev.fallingWords.map(word => ({
        ...word,
        y: word.y + (word.speed * 0.5)
      }));

      // Remove words that have fallen off screen
      const activeWords = updatedWords.filter(word => {
        if (word.y > 95 && !word.isComplete) {
          // Word missed - count as error
          return false;
        }
        return word.y <= 95 || !word.isComplete;
      });

      // Count missed words (words that fell off screen)
      const missedWords = prev.fallingWords.filter(word => 
        word.y > 95 && !word.isComplete
      ).length;
      
      // Remove completed words after a short delay
      const visibleWords = activeWords.filter(word => 
        !word.isComplete || word.y < 95
      );
      
      return {
        ...prev,
        fallingWords: visibleWords,
        stats: {
          ...prev.stats,
          errorsCount: prev.stats.errorsCount + missedWords
        }
      };
    });
  }, []);

  const handleInput = useCallback((input: string) => {
    setGameState(prev => {
      let newState = { ...prev, currentInput: input };
      
      // Find the word that matches the current input
      const matchingWord = prev.fallingWords.find(word => 
        word.text.toLowerCase().startsWith(input.toLowerCase()) && !word.isComplete
      );

      if (matchingWord) {
        // Update the active word
        newState.activeWordId = matchingWord.id;
        newState.fallingWords = prev.fallingWords.map(word => 
          word.id === matchingWord.id 
            ? { ...word, typed: input, isActive: true }
            : { ...word, isActive: false }
        );

        // Check if word is complete
        if (input.toLowerCase() === matchingWord.text.toLowerCase()) {
          newState.currentInput = '';
          newState.activeWordId = null;
          newState.fallingWords = prev.fallingWords.map(word =>
            word.id === matchingWord.id 
              ? { ...word, isComplete: true, isActive: false, y: word.y - 10 }
              : word
          );
          
          // Update stats
          const timeElapsed = (Date.now() - prev.gameStartTime) / 1000;
          const wordsTyped = prev.stats.wordsTyped + 1;
          const wpm = Math.round((wordsTyped / timeElapsed) * 60);
          const accuracy = Math.round((wordsTyped / (wordsTyped + prev.stats.errorsCount)) * 100);
          
          newState.stats = {
            ...prev.stats,
            score: prev.stats.score + matchingWord.text.length * 10,
            wordsTyped,
            wpm: wpm || 0,
            accuracy: accuracy || 100,
            level: Math.floor(wordsTyped / 10) + 1,
            timeElapsed: Math.round(timeElapsed)
          };
        }
      } else if (input.length > 0) {
        // No matching word - could be an error or new word starting
        newState.activeWordId = null;
        newState.fallingWords = prev.fallingWords.map(word => 
          ({ ...word, isActive: false })
        );
      }

      return newState;
    });
  }, []);

  const startGame = useCallback((difficulty: DifficultyLevel) => {
    // Clear any existing timers
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
    }
    
    setGameState(prev => ({
      ...prev,
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
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const stopGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      isGameOver: true
    }));
  }, []);

  const resetGame = useCallback(() => {
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

  // Game loop
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      const gameLoop = () => {
        updateWordPositions();
        if (gameState.isPlaying && !gameState.isPaused) {
          gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
      };
      gameLoopRef.current = requestAnimationFrame(gameLoop);

      const config = GAME_CONFIG[gameState.difficulty];
      spawnTimerRef.current = setInterval(spawnWord, config.spawnRate);
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.difficulty, spawnWord, updateWordPositions]);

  // Auto-end game when too many words are missed
  useEffect(() => {
    if (gameState.stats.errorsCount >= 10 && gameState.isPlaying) {
      stopGame();
    }
  }, [gameState.stats.errorsCount, gameState.isPlaying, stopGame]);

  return {
    gameState,
    startGame,
    pauseGame,
    stopGame,
    resetGame,
    handleInput
  };
};
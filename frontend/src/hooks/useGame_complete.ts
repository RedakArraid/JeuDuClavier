  const stopGame = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    shouldSpawnRef.current = false;
    currentTypedRef.current = '';
    
    // Vérifier si c'est un nouveau high score avant d'arrêter
    const finalScore = gameState.stats.score;
    if (finalScore > 0) {
      checkForNewHighScore(finalScore);
    }
    
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      isGameOver: true
    }));
  }, [gameState.stats.score, checkForNewHighScore]);

  const resetGame = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    originalWordRef.current = '';
    currentTypedRef.current = '';
    shouldSpawnRef.current = false;
    setShowNewScoreModal(false);
    setIsNewHighScore(false);
    
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
    highScores,
    showNewScoreModal,
    isNewHighScore,
    startGame,
    pauseGame,
    stopGame,
    resetGame,
    handleKeyPress,
    handleBackspace,
    saveNewHighScore,
    closeNewScoreModal: () => setShowNewScoreModal(false)
  };
};
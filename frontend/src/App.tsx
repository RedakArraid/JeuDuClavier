import React from 'react';
import { useGame } from './hooks/useGame';
import { GameArea } from './components/GameArea';
import { GameStats } from './components/GameStats';
import { GameMenu } from './components/GameMenu';
import { GameOverScreen } from './components/GameOverScreen';

function App() {
  const { 
    gameState, 
    startGame, 
    pauseGame, 
    stopGame, 
    resetGame, 
    handleInput 
  } = useGame();

  const handleRestart = () => {
    resetGame();
    startGame(gameState.difficulty);
  };

  const handleNewGame = () => {
    resetGame();
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Game Area - occuppe tout l'écran */}
      <GameArea
        fallingWords={gameState.fallingWords}
        currentInput={gameState.currentInput}
        onInputChange={handleInput}
        isPlaying={gameState.isPlaying && !gameState.isPaused}
      />

      {/* Game Stats - overlay */}
      <GameStats 
        stats={gameState.stats} 
        isVisible={gameState.isPlaying && !gameState.isPaused}
      />

      {/* Game Menu - overlay */}
      {(!gameState.isPlaying || gameState.isPaused) && !gameState.isGameOver && (
        <GameMenu
          isPlaying={gameState.isPlaying}
          isPaused={gameState.isPaused}
          difficulty={gameState.difficulty}
          onStart={startGame}
          onPause={pauseGame}
          onStop={stopGame}
          onReset={resetGame}
        />
      )}

      {/* Game Over Screen - overlay */}
      {gameState.isGameOver && (
        <GameOverScreen
          stats={gameState.stats}
          onRestart={handleRestart}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  );
}

export default App;

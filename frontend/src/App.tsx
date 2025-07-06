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
    handleKeyPress,
    handleBackspace
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
      {/* Game Area - mode clavier direct */}
      <GameArea
        fallingWords={gameState.fallingWords}
        currentInput={gameState.currentInput}
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
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

      {/* Instructions globales pour le clavier direct */}
      {gameState.isPlaying && !gameState.isPaused && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm z-10">
          <div className="flex items-center space-x-4">
            <span>⌨️ Tapez directement</span>
            <span>⌫ Backspace pour corriger</span>
            <span>ESC pour pause</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

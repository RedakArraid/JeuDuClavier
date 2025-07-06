import React from 'react';
import { useGame } from './hooks/useGame';
import { GameArea } from './components/GameArea';
import { GameStats } from './components/GameStats';
import { GameMenu } from './components/GameMenu';
import { GameOverScreen } from './components/GameOverScreen';
import { useLanguage } from './i18n/LanguageContext';

function App() {
  const { language } = useLanguage();
  const { 
    gameState, 
    startGame, 
    pauseGame, 
    stopGame, 
    resetGame, 
    handleKeyPress,
    handleBackspace
  } = useGame(language);

  const handleRestart = () => {
    resetGame();
    startGame(gameState.difficulty);
  };

  const handleNewGame = () => {
    resetGame();
  };

  const handleReturnToMenu = () => {
    resetGame();
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Layout principal avec jeu centré */}
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* Container relatif pour le jeu et ses stats */}
        <div className="relative">
          {/* Game Area */}
          <GameArea
            fallingWords={gameState.fallingWords}
            currentInput={gameState.currentInput}
            onKeyPress={handleKeyPress}
            onBackspace={handleBackspace}
            onTogglePause={pauseGame}
            onReturnToMenu={handleReturnToMenu}
            isPlaying={gameState.isPlaying}
            isPaused={gameState.isPaused}
            difficulty={gameState.difficulty}
          />

          {/* Game Stats - en haut à droite du jeu */}
          {gameState.isPlaying && !gameState.isPaused && (
            <div className="absolute top-0 -right-56">
              <GameStats 
                stats={gameState.stats} 
                isVisible={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Game Menu - overlay */}
      {(!gameState.isPlaying && !gameState.isPaused) && !gameState.isGameOver && (
        <GameMenu
          isPlaying={gameState.isPlaying}
          isPaused={gameState.isPaused}
          difficulty={gameState.difficulty}
          onStart={startGame}
          onPause={pauseGame}
          onStop={stopGame}
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

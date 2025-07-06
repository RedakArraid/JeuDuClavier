import React from 'react';
import { useGame } from './hooks/useGame';
import { GameArea } from './components/GameArea';
import { GameStats } from './components/GameStats';
import { GameMenu } from './components/GameMenu';
import { GameOverScreen } from './components/GameOverScreen';
import { NewScoreModal } from './components/NewScoreModal';
import { HighScoresDisplay } from './components/HighScoresDisplay';
import { useLanguage } from './i18n/LanguageContext';

function App() {
  const { language } = useLanguage();
  const { 
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
    closeNewScoreModal
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

          {/* High Scores - en dessous des stats pendant le jeu */}
          {gameState.isPlaying && !gameState.isPaused && (
            <div className="absolute top-72 -right-72">
              <HighScoresDisplay
                highScores={highScores}
                difficulty={gameState.difficulty}
                language={language}
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

      {/* New Score Modal */}
      <NewScoreModal
        isOpen={showNewScoreModal}
        score={gameState.stats.score}
        difficulty={gameState.difficulty}
        language={language}
        onSubmit={saveNewHighScore}
        onClose={closeNewScoreModal}
      />


    </div>
  );
}

export default App;

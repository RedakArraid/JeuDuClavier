import React from 'react';
import { GameStats } from '../types/game';
import { Trophy, Target, Clock, TrendingUp, RotateCcw, Play } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface GameOverScreenProps {
  stats: GameStats;
  onRestart: () => void;
  onNewGame: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ 
  stats, 
  onRestart, 
  onNewGame 
}) => {
  const { t } = useLanguage();
  
  const getPerformanceMessage = () => {
    if (stats.wpm >= 70) return { message: t.congratulations, color: "text-yellow-400" };
    if (stats.wpm >= 50) return { message: t.congratulations, color: "text-green-400" };
    if (stats.wpm >= 30) return { message: t.congratulations, color: "text-blue-400" };
    return { message: t.congratulations, color: "text-purple-400" };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
        <div className="text-center mb-8">
          <div className={`text-3xl font-bold mb-2 ${performance.color}`}>
            {performance.message}
          </div>
          <div className="text-gray-400">{t.gameOver}</div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="text-center">
            <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.score.toLocaleString()}</div>
            <div className="text-sm text-gray-400">{t.stats.score}</div>
          </div>

          <div className="text-center">
            <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.wpm}</div>
            <div className="text-sm text-gray-400">{t.stats.wpm}</div>
          </div>

          <div className="text-center">
            <Target className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.accuracy}%</div>
            <div className="text-sm text-gray-400">{t.stats.accuracy}</div>
          </div>

          <div className="text-center">
            <Clock className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.timeElapsed}s</div>
            <div className="text-sm text-gray-400">{t.stats.time}</div>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="text-lg text-white mb-2">
            {stats.wordsTyped} <span className="font-bold text-blue-400">{t.stats.wordsTyped}</span>
          </div>
          <div className="text-lg text-white">
            {t.stats.level} <span className="font-bold text-yellow-400">{stats.level}</span>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
            {t.restart}
          </button>
          <button
            onClick={onNewGame}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Play className="h-5 w-5" />
            {t.newGame}
          </button>
        </div>
      </div>
    </div>
  );
};
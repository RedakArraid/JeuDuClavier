import React from 'react';
import { DifficultyLevel } from '../types/game';
import { Play, Pause, Square, RotateCcw, Trophy, Zap, Target, Star } from 'lucide-react';

interface GameMenuProps {
  isPlaying: boolean;
  isPaused: boolean;
  difficulty: DifficultyLevel;
  onStart: (difficulty: DifficultyLevel) => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({
  isPlaying,
  isPaused,
  difficulty,
  onStart,
  onPause,
  onStop,
  onReset
}) => {
  const difficulties = [
    { id: 'easy' as DifficultyLevel, label: 'Easy', icon: Trophy, color: 'text-green-400', desc: 'Simple words, slow pace' },
    { id: 'normal' as DifficultyLevel, label: 'Normal', icon: Target, color: 'text-blue-400', desc: 'Medium words, moderate pace' },
    { id: 'hard' as DifficultyLevel, label: 'Hard', icon: Zap, color: 'text-orange-400', desc: 'Long words, fast pace' },
    { id: 'expert' as DifficultyLevel, label: 'Expert', icon: Star, color: 'text-red-400', desc: 'Reversed words, very fast' }
  ];

  if (isPlaying && !isPaused) {
    return (
      <div className="absolute top-4 left-4 flex gap-2">
        <button
          onClick={onPause}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
        >
          <Pause className="h-4 w-4" />
          Pause
        </button>
        <button
          onClick={onStop}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Square className="h-4 w-4" />
          Stop
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">JeuDuClavier</h1>
          <p className="text-gray-400">Master your typing speed and accuracy</p>
        </div>

        {isPaused ? (
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-4">Game Paused</div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onPause}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Play className="h-5 w-5" />
                Resume
              </button>
              <button
                onClick={onStop}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Square className="h-5 w-5" />
                Stop
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Choose Difficulty</h2>
              <div className="grid grid-cols-2 gap-3">
                {difficulties.map(({ id, label, icon: Icon, color, desc }) => (
                  <button
                    key={id}
                    onClick={() => onStart(id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      difficulty === id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                    }`}
                  >
                    <Icon className={`h-8 w-8 ${color} mx-auto mb-2`} />
                    <div className="text-white font-semibold">{label}</div>
                    <div className="text-xs text-gray-400 mt-1">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {!isPlaying && (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={onReset}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
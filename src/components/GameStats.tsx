import React from 'react';
import { GameStats as GameStatsType } from '../types/game';
import { Trophy, Target, Clock, TrendingUp } from 'lucide-react';

interface GameStatsProps {
  stats: GameStatsType;
  isVisible?: boolean;
}

export const GameStats: React.FC<GameStatsProps> = ({ stats, isVisible = true }) => {
  if (!isVisible) return null;

  const statItems = [
    { icon: Trophy, label: 'Score', value: stats.score.toLocaleString(), color: 'text-yellow-400' },
    { icon: TrendingUp, label: 'WPM', value: stats.wpm.toString(), color: 'text-blue-400' },
    { icon: Target, label: 'Accuracy', value: `${stats.accuracy}%`, color: 'text-green-400' },
    { icon: Clock, label: 'Time', value: `${stats.timeElapsed}s`, color: 'text-purple-400' }
  ];

  return (
    <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 min-w-[200px]">
      <div className="text-center mb-3">
        <div className="text-2xl font-bold text-white">Level {stats.level}</div>
        <div className="text-sm text-gray-400">{stats.wordsTyped} words typed</div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {statItems.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex flex-col items-center">
            <Icon className={`h-5 w-5 ${color} mb-1`} />
            <div className="text-xs text-gray-400">{label}</div>
            <div className={`text-sm font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>
      
      {stats.errorsCount > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-center text-xs text-red-400">
            Errors: {stats.errorsCount}
          </div>
        </div>
      )}
    </div>
  );
};
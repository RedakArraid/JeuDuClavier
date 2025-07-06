import React from 'react';
import { GameStats as GameStatsType } from '../types/game';
import { Trophy, Target, Clock, TrendingUp, Zap } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface GameStatsProps {
  stats: GameStatsType;
  isVisible?: boolean;
}

export const GameStats: React.FC<GameStatsProps> = ({ stats, isVisible = true }) => {
  const { t } = useLanguage();
  
  if (!isVisible) return null;

  const statItems = [
    { icon: Trophy, label: t.stats.score, value: stats.score.toLocaleString(), color: 'text-yellow-400' },
    { icon: TrendingUp, label: t.stats.wpm, value: stats.wpm.toString(), color: 'text-blue-400' },
    { icon: Target, label: t.stats.accuracy, value: `${stats.accuracy}%`, color: 'text-green-400' },
    { icon: Clock, label: t.stats.time, value: `${stats.timeElapsed}s`, color: 'text-purple-400' },
    { icon: Zap, label: t.stats.speed, value: stats.currentSpeed.toFixed(1), color: 'text-orange-400' }
  ];

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 min-w-[200px]">
      <div className="text-center mb-3">
        <div className="text-2xl font-bold text-white">{t.stats.level} {stats.level}</div>
        <div className="text-sm text-gray-400">{stats.wordsTyped} {t.stats.wordsTyped}</div>
      </div>
      
      <div className="space-y-2">
        {/* Première ligne - Score et WPM */}
        <div className="grid grid-cols-2 gap-3">
          {statItems.slice(0, 2).map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex flex-col items-center">
              <Icon className={`h-5 w-5 ${color} mb-1`} />
              <div className="text-xs text-gray-400">{label}</div>
              <div className={`text-sm font-bold ${color}`}>{value}</div>
            </div>
          ))}
        </div>
        
        {/* Deuxième ligne - Accuracy, Time, Speed */}
        <div className="grid grid-cols-3 gap-2">
          {statItems.slice(2).map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex flex-col items-center">
              <Icon className={`h-4 w-4 ${color} mb-1`} />
              <div className="text-xs text-gray-400">{label}</div>
              <div className={`text-xs font-bold ${color}`}>{value}</div>
            </div>
          ))}
        </div>
      </div>
      
      {stats.errorsCount > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-center text-xs text-red-400">
            {t.stats.errors}: {stats.errorsCount}
          </div>
        </div>
      )}
    </div>
  );
};
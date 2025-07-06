import React from 'react';
import { DifficultyLevel } from '../types/game';
import { Play, Pause, Square, Trophy, Zap, Target, Star } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface GameMenuProps {
  isPlaying: boolean;
  isPaused: boolean;
  difficulty: DifficultyLevel;
  onStart: (difficulty: DifficultyLevel) => void;
  onPause: () => void;
  onStop: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({
  isPlaying,
  isPaused,
  difficulty,
  onStart,
  onPause,
  onStop
}) => {
  const { language, setLanguage, t } = useLanguage();
  
  const difficulties = [
    { id: 'easy' as DifficultyLevel, label: t.difficulties.easy.label, icon: Trophy, color: 'text-green-400', desc: t.difficulties.easy.desc },
    { id: 'normal' as DifficultyLevel, label: t.difficulties.normal.label, icon: Target, color: 'text-blue-400', desc: t.difficulties.normal.desc },
    { id: 'hard' as DifficultyLevel, label: t.difficulties.hard.label, icon: Zap, color: 'text-orange-400', desc: t.difficulties.hard.desc },
    { id: 'expert' as DifficultyLevel, label: t.difficulties.expert.label, icon: Star, color: 'text-red-400', desc: t.difficulties.expert.desc }
  ];

  if (isPlaying && !isPaused) {
    return (
      <div className="absolute top-4 left-4 flex gap-2">
        <button
          onClick={onPause}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
        >
          <Pause className="h-4 w-4" />
          {t.pause}
        </button>
        <button
          onClick={onStop}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Square className="h-4 w-4" />
          {t.stop}
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t.gameTitle}</h1>
          <p className="text-gray-400">{t.gameSubtitle}</p>
        </div>

        {isPaused ? (
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-4">{t.gamePaused}</div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onPause}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Play className="h-5 w-5" />
                {t.resume}
              </button>
              <button
                onClick={onStop}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Square className="h-5 w-5" />
                {t.stop}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Sélecteur de langue */}
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={setLanguage}
              label={t.chooseLanguage}
            />

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">{t.chooseDifficulty}</h2>
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


          </>
        )}
      </div>
    </div>
  );
};
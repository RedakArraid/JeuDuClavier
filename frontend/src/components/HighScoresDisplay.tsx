import React from 'react';
import { HighScore } from '../types/highscore';
import { DifficultyLevel } from '../types/game';
import { Language } from '../i18n/translations';
import { useLanguage } from '../i18n/LanguageContext';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

interface HighScoresDisplayProps {
  highScores: HighScore[];
  difficulty: DifficultyLevel;
  language: Language;
  isVisible?: boolean;
}

export const HighScoresDisplay: React.FC<HighScoresDisplayProps> = ({
  highScores,
  difficulty,
  language,
  isVisible = true
}) => {
  const { t } = useLanguage();

  if (!isVisible || highScores.length === 0) return null;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-400" />;
      case 2: return <Medal className="h-5 w-5 text-gray-300" />;
      case 3: return <Award className="h-5 w-5 text-orange-400" />;
      default: return <Trophy className="h-4 w-4 text-blue-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 2: return 'text-gray-300 bg-gray-300/10 border-gray-300/20';
      case 3: return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const difficultyLabels = {
    fr: { easy: 'Facile', normal: 'Normal', hard: 'Difficile', expert: 'Expert' },
    en: { easy: 'Easy', normal: 'Normal', hard: 'Hard', expert: 'Expert' }
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 min-w-[260px] max-w-[300px]">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center mb-2">
          <Trophy className="h-5 w-5 text-yellow-400 mr-2" />
          <h3 className="text-lg font-bold text-white">
            {language === 'fr' ? 'Top 3' : 'Top 3'}
          </h3>
        </div>
        <div className="text-sm text-gray-400">
          {difficultyLabels[language][difficulty]}
        </div>
      </div>

      {/* Scores List */}
      <div className="space-y-2">
        {highScores.map((score, index) => (
          <div
            key={score.id}
            className={`flex items-center p-2 rounded-lg border ${getRankColor(index + 1)}`}
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-10 h-10 mr-3">
              {getRankIcon(index + 1)}
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-white truncate">
                  {score.playerName}
                </div>
                <div className="text-sm font-bold text-white ml-2">
                  {score.score.toLocaleString()}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-2">
                  <span>{score.wpm} {t.stats.wpm}</span>
                  <span>•</span>
                  <span>{score.accuracy}%</span>
                </div>
                <div>
                  {formatDate(score.date)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {highScores.length < 3 && (
        <div className="text-center mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-500">
            {language === 'fr' 
              ? `${3 - highScores.length} place(s) disponible(s)`
              : `${3 - highScores.length} spot(s) available`
            }
          </div>
        </div>
      )}
    </div>
  );
};

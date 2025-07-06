import React from 'react';
import { FallingWord as FallingWordType, DifficultyLevel } from '../types/game';

interface FallingWordProps {
  word: FallingWordType;
  difficulty: DifficultyLevel;
}

export const FallingWord: React.FC<FallingWordProps> = ({ word, difficulty }) => {
  const isExpertMode = difficulty === 'expert';
  
  return (
    <div className="absolute select-none pointer-events-none" style={{
      left: `${word.x}%`,
      top: `${word.y}%`,
      transform: 'translateX(-50%)',
      zIndex: 10
    }}>
      {/* Mot principal */}
      <div
        className={`text-3xl font-bold drop-shadow-lg ${
          isExpertMode ? 'text-purple-300' : 'text-white'
        }`}
        style={{
          textShadow: isExpertMode 
            ? '0 0 15px rgba(147, 51, 234, 1), 3px 3px 6px rgba(0,0,0,0.8)'
            : '0 0 15px rgba(59, 130, 246, 1), 3px 3px 6px rgba(0,0,0,0.8)',
          fontFamily: 'monospace'
        }}
      >
        {word.text}
      </div>
      
      {/* Indicateur mode expert */}
      {isExpertMode && (
        <div className="text-center mt-1">
          <div className="text-xs text-purple-400 animate-pulse">
            ←← Type from right to left ←←
          </div>
        </div>
      )}
    </div>
  );
};

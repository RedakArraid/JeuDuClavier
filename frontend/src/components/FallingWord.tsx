import React from 'react';
import { FallingWord as FallingWordType } from '../types/game';

interface FallingWordProps {
  word: FallingWordType;
}

export const FallingWord: React.FC<FallingWordProps> = ({ word }) => {
  return (
    <div
      className="absolute text-3xl font-bold text-white drop-shadow-lg select-none pointer-events-none"
      style={{
        left: `${word.x}%`,
        top: `${word.y}%`,
        transform: 'translateX(-50%)',
        textShadow: '0 0 15px rgba(59, 130, 246, 1), 3px 3px 6px rgba(0,0,0,0.8)',
        zIndex: 10,
        fontFamily: 'monospace'
      }}
    >
      {word.text}
    </div>
  );
};

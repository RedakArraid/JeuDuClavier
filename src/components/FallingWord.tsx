import React from 'react';
import { FallingWord as FallingWordType } from '../types/game';

interface FallingWordProps {
  word: FallingWordType;
}

export const FallingWord: React.FC<FallingWordProps> = ({ word }) => {
  const getWordStyle = () => {
    const baseClasses = "absolute text-xl font-bold transition-all duration-100 select-none";
    
    if (word.isComplete) {
      return `${baseClasses} text-green-400 opacity-50 animate-pulse`;
    }
    
    if (word.isActive) {
      return `${baseClasses} text-blue-400 scale-110 shadow-lg`;
    }
    
    return `${baseClasses} text-white`;
  };

  const renderWord = () => {
    if (word.typed.length === 0) {
      return <span>{word.text}</span>;
    }

    const typedPart = word.text.slice(0, word.typed.length);
    const remainingPart = word.text.slice(word.typed.length);
    
    return (
      <span>
        <span className="text-green-400 bg-green-400/20 rounded px-1">
          {typedPart}
        </span>
        <span>{remainingPart}</span>
      </span>
    );
  };

  return (
    <div
      className={getWordStyle()}
      style={{
        left: `${word.x}%`,
        top: `${word.y}%`,
        transform: word.isActive ? 'scale(1.1)' : 'scale(1)',
        textShadow: word.isActive ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'
      }}
    >
      {renderWord()}
    </div>
  );
};
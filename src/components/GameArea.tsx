import React from 'react';
import { FallingWord } from './FallingWord';
import { GameInput } from './GameInput';
import { FallingWord as FallingWordType } from '../types/game';

interface GameAreaProps {
  fallingWords: FallingWordType[];
  currentInput: string;
  onInputChange: (value: string) => void;
  isPlaying: boolean;
}

export const GameArea: React.FC<GameAreaProps> = ({
  fallingWords,
  currentInput,
  onInputChange,
  isPlaying
}) => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Background animation */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse"></div>
      </div>

      {/* Falling words */}
      {fallingWords.map((word) => (
        <FallingWord key={word.id} word={word} />
      ))}

      {/* Game input */}
      <GameInput
        value={currentInput}
        onChange={onInputChange}
        isActive={isPlaying}
        placeholder="Type the falling words..."
      />

      {/* Game area guidelines */}
      {isPlaying && (
        <>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-50"></div>
          <div className="absolute bottom-24 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>
        </>
      )}
    </div>
  );
};
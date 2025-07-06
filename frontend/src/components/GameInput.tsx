import React, { useEffect, useRef } from 'react';
import { Keyboard } from 'lucide-react';

interface GameInputProps {
  value: string;
  onChange: (value: string) => void;
  isActive: boolean;
  placeholder?: string;
}

export const GameInput: React.FC<GameInputProps> = ({ 
  value, 
  onChange, 
  isActive, 
  placeholder = "Tapez les mots..." 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
    }
  };

  return (
    <div className="relative w-full">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <Keyboard className="h-4 w-4 text-gray-400" />
      </div>
      
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-gray-900/90 backdrop-blur-sm border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-mono"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />
      
      {value && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

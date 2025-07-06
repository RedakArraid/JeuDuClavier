import React, { useEffect, useRef } from 'react';
import { FallingWord } from './FallingWord';
import { FallingWord as FallingWordType } from '../types/game';

interface GameAreaProps {
  fallingWords: FallingWordType[];
  currentInput: string;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  isPlaying: boolean;
}

export const GameArea: React.FC<GameAreaProps> = ({
  fallingWords,
  currentInput,
  onKeyPress,
  onBackspace,
  isPlaying
}) => {
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Gestion des événements clavier
  useEffect(() => {
    if (!isPlaying) return;

    let lastKeyTime = 0;
    let lastKey = '';

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      
      // Empêcher les appels doubles (même touche dans les 100ms)
      if (e.key === lastKey && now - lastKeyTime < 100) {
        return;
      }
      
      lastKey = e.key;
      lastKeyTime = now;
      
      // Ne pas empêcher F12, F5, etc.
      if (e.key === 'F12' || e.key === 'F5' || e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      // Empêcher les actions par défaut pour les autres touches
      e.preventDefault();
      e.stopPropagation();
      
      if (e.key === 'Backspace') {
        onBackspace();
      } else if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        onKeyPress(e.key.toLowerCase());
      }
    };

    // Assurer le focus sur la zone de jeu
    const focusGameArea = () => {
      if (gameAreaRef.current) {
        gameAreaRef.current.focus();
      }
    };

    // Focus initial
    focusGameArea();

    // Ajouter l'écouteur sur document pour capturer tous les événements
    document.addEventListener('keydown', handleKeyDown, true);
    
    // Focus sur clic
    const handleClick = () => {
      focusGameArea();
    };
    
    if (gameAreaRef.current) {
      gameAreaRef.current.addEventListener('click', handleClick);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      if (gameAreaRef.current) {
        gameAreaRef.current.removeEventListener('click', handleClick);
      }
    };
  }, [isPlaying, onKeyPress, onBackspace]);

  // Focus automatique quand le jeu commence/reprend
  useEffect(() => {
    if (isPlaying && gameAreaRef.current) {
      setTimeout(() => {
        gameAreaRef.current?.focus();
      }, 100);
    }
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Cadre de jeu avec focus pour capturer les événements clavier */}
      <div 
        ref={gameAreaRef}
        tabIndex={0}
        className="relative w-full max-w-md h-[85vh] bg-gradient-to-br from-gray-800 via-blue-900 to-purple-900 rounded-xl border-2 border-blue-500/50 shadow-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        
        {/* Zone de jeu délimitée */}
        <div className="absolute inset-4 border border-gray-500/30 rounded-lg">
          
          {/* Ligne de danger (bas du cadre) */}
          <div className="absolute bottom-20 left-0 right-0 h-0.5 bg-red-400 opacity-70 animate-pulse"></div>
          
          {/* Ligne de milieu pour référence */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-400 opacity-30"></div>
          
          {/* Falling word - un seul à la fois */}
          {fallingWords.map((word) => (
            <FallingWord key={word.id} word={word} />
          ))}
          
          {/* Indication si aucun mot */}
          {fallingWords.length === 0 && isPlaying && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/50 text-lg animate-pulse">
              Prochain mot...
            </div>
          )}
        </div>

        {/* Indicateur de saisie en cours */}
        {isPlaying && currentInput && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-lg font-mono border border-green-400/50">
              <span className="text-green-400">{currentInput}</span>
              <span className="animate-pulse text-green-400">|</span>
            </div>
          </div>
        )}

        {/* Indicateur de clic pour activer */}
        {isPlaying && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 text-xs animate-pulse">
            Espace ou ESC pour mettre pause
          </div>
        )}
      </div>
    </div>
  );
};

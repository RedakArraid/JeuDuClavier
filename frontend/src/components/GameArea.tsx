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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Cadre de jeu - HAUTEUR AUGMENTÉE */}
      <div className="relative w-full max-w-md h-[85vh] bg-gradient-to-br from-gray-800 via-blue-900 to-purple-900 rounded-xl border-2 border-blue-500/50 shadow-2xl overflow-hidden">
        
        {/* Zone de jeu délimitée */}
        <div className="absolute inset-4 border border-gray-500/30 rounded-lg">
          
          {/* Ligne de danger (bas du cadre) - ajustée pour la nouvelle hauteur */}
          <div className="absolute bottom-20 left-0 right-0 h-0.5 bg-red-400 opacity-70 animate-pulse"></div>
          
          {/* Ligne de milieu pour référence */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-400 opacity-30"></div>
          
          {/* Falling word - un seul à la fois */}
          {fallingWords.map((word) => (
            <FallingWord key={word.id} word={word} />
          ))}
          
          {/* Indication si aucun mot */}
          {fallingWords.length === 0 && isPlaying && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/50 text-lg">
              Prochain mot...
            </div>
          )}
        </div>

        {/* Zone de saisie en bas du cadre */}
        <div className="absolute bottom-4 left-4 right-4">
          <GameInput
            value={currentInput}
            onChange={onInputChange}
            isActive={isPlaying}
            placeholder="Tapez le mot qui descend..."
          />
        </div>

        {/* Titre du mode */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm">
          Mode Séquentiel - Cadre Étendu
        </div>

        {/* Instructions en mode jeu */}
        {isPlaying && (
          <div className="absolute top-2 right-2 text-xs text-white/70 text-right leading-tight">
            <div>Tapez lettre par lettre</div>
            <div>Le mot se réduit</div>
            <div>Plus de hauteur = plus de temps</div>
          </div>
        )}

        {/* Debug info - position ajustée */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 left-2 bg-black/70 text-white p-2 rounded text-xs">
            <div>Mots: {fallingWords.length}</div>
            <div>Jeu: {isPlaying ? 'Actif' : 'Arrêté'}</div>
            <div>Saisie: "{currentInput}"</div>
            {fallingWords.length > 0 && (
              <>
                <div>Mot: "{fallingWords[0].text}"</div>
                <div>Y: {fallingWords[0].y.toFixed(1)}%</div>
              </>
            )}
            <div className="mt-1 text-yellow-400">Cadre: 85vh</div>
          </div>
        )}

        {/* Indicateur de hauteur - coin bas gauche */}
        <div className="absolute bottom-2 left-2 text-xs text-white/50">
          Hauteur étendue
        </div>
      </div>
    </div>
  );
};

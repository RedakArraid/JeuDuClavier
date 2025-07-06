import React, { useState } from 'react';
import { NewScoreModalProps } from '../types/highscore';
import { useLanguage } from '../i18n/LanguageContext';
import { Trophy, User, Mail, X } from 'lucide-react';

export const NewScoreModal: React.FC<NewScoreModalProps> = ({
  isOpen,
  score,
  difficulty,
  language,
  onSubmit,
  onClose
}) => {
  const { t } = useLanguage();
  const [playerName, setPlayerName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (playerName.trim().length < 2) {
      alert(language === 'fr' ? 'Le nom doit contenir au moins 2 caractères' : 'Name must be at least 2 characters');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(playerName.trim(), email.trim() || undefined);
      setPlayerName('');
      setEmail('');
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const difficultyLabels = {
    fr: { easy: 'Facile', normal: 'Normal', hard: 'Difficile', expert: 'Expert' },
    en: { easy: 'Easy', normal: 'Normal', hard: 'Hard', expert: 'Expert' }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-yellow-400/20">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-12 w-12 text-yellow-400 mr-3" />
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {language === 'fr' ? 'Nouveau Record !' : 'New High Score!'}
              </div>
              <div className="text-sm text-gray-400">
                {difficultyLabels[language][difficulty]} • {score.toLocaleString()} {language === 'fr' ? 'points' : 'points'}
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <p className="text-gray-300 text-sm">
            {language === 'fr' 
              ? 'Félicitations ! Entrez vos informations pour enregistrer votre score.'
              : 'Congratulations! Enter your information to save your score.'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom du joueur */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              <User className="h-4 w-4 inline mr-2" />
              {language === 'fr' ? 'Nom du joueur' : 'Player Name'} *
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder={language === 'fr' ? 'Entrez votre nom' : 'Enter your name'}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
              maxLength={30}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Email (optionnel) */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              {language === 'fr' ? 'Email (optionnel)' : 'Email (optional)'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={language === 'fr' ? 'votre@email.com' : 'your@email.com'}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-400 mt-1">
              {language === 'fr' 
                ? 'Pour être notifié si quelqu\'un bat votre record'
                : 'To be notified if someone beats your record'
              }
            </p>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || playerName.trim().length < 2}
            >
              {isSubmitting 
                ? (language === 'fr' ? 'Enregistrement...' : 'Saving...')
                : (language === 'fr' ? 'Enregistrer' : 'Save Score')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

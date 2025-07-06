import React from 'react';
import { Language } from '../i18n/translations';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  label: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  label
}) => {
  const flags = {
    fr: '🇫🇷',
    en: '🇬🇧'
  };
  
  const languageNames = {
    fr: 'Français',
    en: 'English'
  };
  
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">{label}</h2>
      <div className="flex gap-2 justify-center">
        {(Object.keys(flags) as Language[]).map((lang) => (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className={`w-12 h-12 rounded-lg border-2 transition-all flex items-center justify-center ${
              currentLanguage === lang
                ? 'border-blue-500 bg-blue-500/20 shadow-lg'
                : 'border-gray-600 hover:border-gray-500 bg-gray-700/50 hover:bg-gray-700'
            }`}
            title={languageNames[lang]}
          >
            <span className="text-2xl">{flags[lang]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

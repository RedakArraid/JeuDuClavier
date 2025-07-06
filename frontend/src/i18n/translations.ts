export type Language = 'fr' | 'en';

export interface Translations {
  // Menu principal
  gameTitle: string;
  gameSubtitle: string;
  chooseDifficulty: string;
  chooseLanguage: string;
  
  // Difficultés
  difficulties: {
    easy: { label: string; desc: string; };
    normal: { label: string; desc: string; };
    hard: { label: string; desc: string; };
    expert: { label: string; desc: string; };
  };
  
  // Boutons de contrôle
  pause: string;
  resume: string;
  stop: string;
  restart: string;
  newGame: string;
  menu: string;
  
  // État du jeu
  gamePaused: string;
  gameOver: string;
  nextWord: string;
  
  // Instructions
  spaceOrEscResume: string;
  mForMenu: string;
  spaceOrEscPause: string;
  
  // Statistiques
  stats: {
    score: string;
    wpm: string;
    accuracy: string;
    level: string;
    wordsTyped: string;
    errors: string;
    time: string;
    speed: string;
  };
  
  // Game Over
  finalScore: string;
  congratulations: string;
}

export const translations: Record<Language, Translations> = {
  fr: {
    gameTitle: "JeuDuClavier",
    gameSubtitle: "Maîtrisez votre vitesse de frappe et précision",
    chooseDifficulty: "Choisir la difficulté",
    chooseLanguage: "Choisir la langue",
    
    difficulties: {
      easy: { label: "Facile", desc: "Mots simples, rythme lent" },
      normal: { label: "Normal", desc: "Mots moyens, rythme modéré" },
      hard: { label: "Difficile", desc: "Mots longs, rythme rapide" },
      expert: { label: "Expert", desc: "Mots inversés, très rapide" }
    },
    
    pause: "Pause",
    resume: "Reprendre",
    stop: "Arrêter",
    restart: "Recommencer",
    newGame: "Nouveau jeu",
    menu: "Menu",
    
    gamePaused: "Jeu en pause",
    gameOver: "Jeu terminé",
    nextWord: "Prochain mot...",
    
    spaceOrEscResume: "pour reprendre",
    mForMenu: "pour retourner au menu principal",
    spaceOrEscPause: "Espace ou ESC pour pause",
    
    stats: {
      score: "Score",
      wpm: "MPM",
      accuracy: "Précision",
      level: "Niveau",
      wordsTyped: "Mots tapés",
      errors: "Erreurs",
      time: "Temps",
      speed: "Vitesse"
    },
    
    finalScore: "Score final",
    congratulations: "Félicitations !"
  },
  
  en: {
    gameTitle: "TypingGame",
    gameSubtitle: "Master your typing speed and accuracy",
    chooseDifficulty: "Choose Difficulty",
    chooseLanguage: "Choose Language",
    
    difficulties: {
      easy: { label: "Easy", desc: "Simple words, slow pace" },
      normal: { label: "Normal", desc: "Medium words, moderate pace" },
      hard: { label: "Hard", desc: "Long words, fast pace" },
      expert: { label: "Expert", desc: "Reversed words, very fast" }
    },
    
    pause: "Pause",
    resume: "Resume",
    stop: "Stop",
    restart: "Restart",
    newGame: "New Game",
    menu: "Menu",
    
    gamePaused: "Game Paused",
    gameOver: "Game Over",
    nextWord: "Next word...",
    
    spaceOrEscResume: "to resume",
    mForMenu: "to return to main menu",
    spaceOrEscPause: "Space or ESC to pause",
    
    stats: {
      score: "Score",
      wpm: "WPM",
      accuracy: "Accuracy",
      level: "Level",
      wordsTyped: "Words typed",
      errors: "Errors",
      time: "Time",
      speed: "Speed"
    },
    
    finalScore: "Final Score",
    congratulations: "Congratulations!"
  }
};

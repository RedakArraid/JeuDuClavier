// frontend/src/services/wordPreloader.ts
// ⚡ Service pour pre-loader des mots et améliorer les performances

import { DifficultyLevel } from '../types/game';
import { Language } from '../i18n/translations';
import { databaseWordService } from './databaseWordService';

interface PreloadedWord {
  text: string;
  difficulty: DifficultyLevel;
  language: Language;
  level: number;
  timestamp: number;
}

class WordPreloader {
  private preloadedWords = new Map<string, PreloadedWord[]>();
  private isPreloading = false;
  private preloadSize = 20; // Nombre de mots à pre-loader
  private maxAge = 10 * 60 * 1000; // 10 minutes

  // 🎯 Récupérer un mot (avec pre-loading)
  async getWord(difficulty: DifficultyLevel, language: Language, level: number): Promise<string> {
    const key = `${difficulty}-${language}-${Math.floor(level / 3)}`; // Grouper par tranches de niveau
    
    // Vérifier si on a des mots pre-loadés
    const preloaded = this.preloadedWords.get(key);
    if (preloaded && preloaded.length > 0) {
      // Filtrer les mots trop anciens
      const validWords = preloaded.filter(w => Date.now() - w.timestamp < this.maxAge);
      
      if (validWords.length > 0) {
        // Prendre un mot aléatoire et le retirer de la liste
        const randomIndex = Math.floor(Math.random() * validWords.length);
        const selectedWord = validWords.splice(randomIndex, 1)[0];
        
        // Mettre à jour la liste
        this.preloadedWords.set(key, validWords);
        
        // Re-remplir si nécessaire
        if (validWords.length < 5) {
          this.preloadWordsInBackground(difficulty, language, level);
        }
        
        return selectedWord.text;
      }
    }
    
    // Pas de mots pre-loadés, récupérer directement
    const word = await databaseWordService.getRandomWord(difficulty, language, level);
    
    // Lancer le pre-loading en arrière-plan
    this.preloadWordsInBackground(difficulty, language, level);
    
    return word;
  }

  // 🔄 Pre-loader des mots en arrière-plan
  private async preloadWordsInBackground(difficulty: DifficultyLevel, language: Language, level: number): Promise<void> {
    if (this.isPreloading) return;
    
    this.isPreloading = true;
    const key = `${difficulty}-${language}-${Math.floor(level / 3)}`;
    
    try {
      console.log(`⚡ Pre-loading ${this.preloadSize} mots pour ${key}...`);
      
      const words = await databaseWordService.getBatchWords(
        difficulty, 
        language, 
        level, 
        this.preloadSize
      );
      
      const preloadedWords: PreloadedWord[] = words.map(text => ({
        text,
        difficulty,
        language,
        level,
        timestamp: Date.now()
      }));
      
      this.preloadedWords.set(key, preloadedWords);
      console.log(`✅ ${words.length} mots pre-loadés pour ${key}`);
      
    } catch (error) {
      console.warn('Erreur pre-loading:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  // 🎮 Pre-loader au démarrage du jeu
  async preloadForGame(difficulty: DifficultyLevel, language: Language): Promise<void> {
    console.log(`🎮 Pre-loading pour nouvelle partie: ${difficulty} ${language}`);
    
    // Pre-loader pour les premiers niveaux
    const promises = [];
    for (let level = 1; level <= 9; level += 3) {
      promises.push(this.preloadWordsInBackground(difficulty, language, level));
    }
    
    await Promise.all(promises);
    console.log('✅ Pre-loading initial terminé');
  }

  // 🧹 Nettoyer les mots expirés
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, words] of this.preloadedWords.entries()) {
      const validWords = words.filter(w => now - w.timestamp < this.maxAge);
      
      if (validWords.length === 0) {
        this.preloadedWords.delete(key);
      } else if (validWords.length !== words.length) {
        this.preloadedWords.set(key, validWords);
      }
    }
  }

  // 📊 Statistiques de cache
  getStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [key, words] of this.preloadedWords.entries()) {
      stats[key] = {
        count: words.length,
        oldestAge: words.length > 0 ? Math.round((Date.now() - Math.min(...words.map(w => w.timestamp))) / 1000) : 0
      };
    }
    
    return {
      cacheKeys: Object.keys(stats).length,
      totalWords: Object.values(stats).reduce((sum: number, stat: any) => sum + stat.count, 0),
      details: stats
    };
  }

  // 🗑️ Vider le cache
  clear(): void {
    this.preloadedWords.clear();
    console.log('🗑️ Cache de pre-loading vidé');
  }
}

export const wordPreloader = new WordPreloader();

// Nettoyage automatique toutes les 5 minutes
setInterval(() => {
  wordPreloader.cleanup();
}, 5 * 60 * 1000);
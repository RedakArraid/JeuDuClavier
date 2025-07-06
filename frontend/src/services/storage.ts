// Service pour gérer le stockage local
export interface LocalGameData {
  playerName: string;
  bestScores: Record<string, number>;
  totalGamesPlayed: number;
  preferences: {
    soundEnabled: boolean;
    theme: 'dark' | 'light';
    defaultDifficulty: string;
  };
}

class StorageService {
  private readonly STORAGE_KEY = 'jeu-du-clavier';
  
  private getDefaultData(): LocalGameData {
    return {
      playerName: '',
      bestScores: {
        easy: 0,
        normal: 0,
        hard: 0,
        expert: 0
      },
      totalGamesPlayed: 0,
      preferences: {
        soundEnabled: true,
        theme: 'dark',
        defaultDifficulty: 'normal'
      }
    };
  }

  getLocalData(): LocalGameData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merger avec les valeurs par défaut pour assurer la compatibilité
        return { ...this.getDefaultData(), ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load local data:', error);
    }
    return this.getDefaultData();
  }

  saveLocalData(data: Partial<LocalGameData>): void {
    try {
      const current = this.getLocalData();
      const updated = { ...current, ...data };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save local data:', error);
    }
  }

  updateBestScore(difficulty: string, score: number): void {
    const data = this.getLocalData();
    if (score > data.bestScores[difficulty]) {
      data.bestScores[difficulty] = score;
      this.saveLocalData(data);
    }
  }

  incrementGamesPlayed(): void {
    const data = this.getLocalData();
    data.totalGamesPlayed++;
    this.saveLocalData(data);
  }

  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  exportData(): string {
    return JSON.stringify(this.getLocalData(), null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.saveLocalData(data);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();

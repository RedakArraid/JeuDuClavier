// Service pour communiquer avec le backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ScoreData {
  playerName: string;
  score: number;
  wpm: number;
  accuracy: number;
  level: number;
  difficulty: string;
  wordsTyped: number;
  timeElapsed: number;
}

export interface LeaderboardEntry extends ScoreData {
  id: string;
  timestamp: string;
}

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Scores API
  async saveScore(scoreData: ScoreData): Promise<LeaderboardEntry> {
    const response = await this.request('/scores', {
      method: 'POST',
      body: JSON.stringify(scoreData),
    });
    return response.score;
  }

  async getScores(difficulty?: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    const params = new URLSearchParams();
    if (difficulty) params.append('difficulty', difficulty);
    params.append('limit', limit.toString());
    
    const response = await this.request(`/scores?${params}`);
    return response.scores;
  }

  async getLeaderboard(): Promise<Record<string, LeaderboardEntry[]>> {
    const response = await this.request('/scores/leaderboard');
    return response;
  }

  // Words API
  async getWords(difficulty: string, count: number = 10): Promise<string[]> {
    const response = await this.request(`/words/${difficulty}?count=${count}`);
    return response.words;
  }

  async getRandomWord(difficulty: string): Promise<string> {
    const response = await this.request(`/words/random/${difficulty}`);
    return response.word;
  }

  async validateWord(word: string, difficulty: string): Promise<boolean> {
    const response = await this.request('/words/validate', {
      method: 'POST',
      body: JSON.stringify({ word, difficulty }),
    });
    return response.isValid;
  }

  // Stats API
  async getGlobalStats(): Promise<any> {
    const response = await this.request('/stats/global');
    return response;
  }

  async recordGameStats(gameData: any): Promise<void> {
    await this.request('/stats/game', {
      method: 'POST',
      body: JSON.stringify(gameData),
    });
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      return true;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();

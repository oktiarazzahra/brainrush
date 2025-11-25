import api from './api';

export const gameService = {
  // Create live game (generate PIN)
  createGame: async (quizId) => {
    const response = await api.post('/games', { quizId });
    return response.data;
  },

  // Join game with PIN
  joinGame: async (PIN, playerName, avatar) => {
    const response = await api.post('/games/join', { PIN, playerName, avatar });
    return response.data;
  },

  // Get game details
  getGame: async (gameId) => {
    const response = await api.get(`/games/${gameId}`);
    return response.data;
  },

  // Start game
  startGame: async (gameId) => {
    const response = await api.post(`/games/${gameId}/start`);
    return response.data;
  },

  // Submit answer
  submitAnswer: async (gameId, data) => {
    const response = await api.post(`/games/${gameId}/answer`, data);
    return response.data;
  },

  // Save answer (auto-save without final validation)
  saveAnswer: async (gameId, data) => {
    const response = await api.post(`/games/${gameId}/save-answer`, data);
    return response.data;
  },

  // Next question
  nextQuestion: async (gameId) => {
    const response = await api.post(`/games/${gameId}/next-question`);
    return response.data;
  },

  // End game
  endGame: async (gameId) => {
    const response = await api.post(`/games/${gameId}/end`);
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (gameId) => {
    const response = await api.get(`/games/${gameId}/leaderboard`);
    return response.data;
  },

  // Get user's game history
  getUserHistory: async () => {
    const response = await api.get('/games/history/user');
    return response.data;
  },

  // Get game results
  getGameResults: async (gameId) => {
    const response = await api.get(`/games/${gameId}/results`);
    return response.data;
  }
};

import api from './api';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const gameService = {
  // Create live game (generate PIN)
  createGame: async (quizId) => {
    const response = await api.post('/games', { quizId });
    return response.data;
  },

  // Join game with PIN - for logged-in users
  joinGame: async (PIN, playerName, avatar) => {
    const response = await api.post('/games/join', { PIN, playerName, avatar });
    return response.data;
  },

  // Join game as guest (no token) - for guest players from homepage
  joinGameAsGuest: async (PIN, playerName, avatar) => {
    const response = await axios.post(`${API_URL}/games/join`, {
      PIN,
      playerName,
      avatar
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  // Get game details
  getGame: async (gameId) => {
    const response = await api.get(`/games/${gameId}`);
    return response.data;
  },

  // Get game details as guest (no token)
  getGameAsGuest: async (gameId) => {
    const response = await axios.get(`${API_URL}/games/${gameId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
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

  // Submit answer as guest (no token)
  submitAnswerAsGuest: async (gameId, data) => {
    const response = await axios.post(`${API_URL}/games/${gameId}/answer`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  // Save answer (auto-save without final validation)
  saveAnswer: async (gameId, data) => {
    const response = await api.post(`/games/${gameId}/save-answer`, data);
    return response.data;
  },

  // Save answer as guest (no token)
  saveAnswerAsGuest: async (gameId, data) => {
    const response = await axios.post(`${API_URL}/games/${gameId}/save-answer`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
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

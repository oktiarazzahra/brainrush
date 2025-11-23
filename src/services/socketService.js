import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.eventListeners = new Map(); // Track listeners to prevent duplicates
  }

  connect() {
    if (!this.socket || !this.socket.connected) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'], // Only use websocket, faster than polling
        upgrade: false, // Don't upgrade from polling
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        autoConnect: true,
        // Performance optimizations
        forceNew: false, // Reuse existing connection
        multiplex: true, // Share connection for multiple namespaces
      });

      this.socket.on('connect', () => {
        console.log('🔌 WebSocket connected:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('❌ WebSocket disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 WebSocket reconnected after', attemptNumber, 'attempts');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join game room
  joinGame(gameId, playerName, role = 'player') {
    if (this.socket) {
      this.socket.emit('join-game', { gameId, playerName, role });
      console.log(`🎮 Joining game: ${gameId} as ${role}`);
    }
  }

  // Leave game room
  leaveGame(gameId, playerName) {
    if (this.socket) {
      this.socket.emit('leave-game', { gameId, playerName });
      console.log(`👋 Leaving game: ${gameId}`);
    }
  }

  // Start game (host only)
  startGame(gameId) {
    if (this.socket) {
      this.socket.emit('start-game', { gameId });
      console.log(`🎮 Starting game: ${gameId}`);
    }
  }

  // Move to next question (host only)
  nextQuestion(gameId, questionIndex) {
    if (this.socket) {
      this.socket.emit('next-question', { gameId, questionIndex });
      console.log(`➡️ Next question: ${questionIndex}`);
    }
  }

  // Submit answer
  submitAnswer(gameId, playerName, questionId, isCorrect, score, timeSpent = null) {
    if (this.socket) {
      this.socket.emit('submit-answer', { 
        gameId, 
        playerName, 
        questionId, 
        isCorrect, 
        score,
        timeSpent
      });
      console.log(`✅ Answer submitted by ${playerName}`);
    }
  }

  // End game (host only)
  endGame(gameId, results) {
    if (this.socket) {
      this.socket.emit('end-game', { gameId, results });
      console.log(`🏁 Ending game: ${gameId}`);
    }
  }

  // Update leaderboard
  updateLeaderboard(gameId, leaderboard) {
    if (this.socket) {
      this.socket.emit('update-leaderboard', { gameId, leaderboard });
    }
  }

  // Event listeners with duplicate prevention
  onPlayerJoined(callback) {
    if (this.socket) {
      const eventName = 'player-joined';
      // Remove existing listener if any
      if (this.eventListeners.has(eventName)) {
        this.socket.off(eventName, this.eventListeners.get(eventName));
      }
      this.socket.on(eventName, callback);
      this.eventListeners.set(eventName, callback);
    }
  }

  onPlayerLeft(callback) {
    if (this.socket) {
      const eventName = 'player-left';
      if (this.eventListeners.has(eventName)) {
        this.socket.off(eventName, this.eventListeners.get(eventName));
      }
      this.socket.on(eventName, callback);
      this.eventListeners.set(eventName, callback);
    }
  }

  onGameStarted(callback) {
    if (this.socket) {
      const eventName = 'game-started';
      if (this.eventListeners.has(eventName)) {
        this.socket.off(eventName, this.eventListeners.get(eventName));
      }
      this.socket.on(eventName, callback);
      this.eventListeners.set(eventName, callback);
    }
  }

  onQuestionChanged(callback) {
    if (this.socket) {
      const eventName = 'question-changed';
      if (this.eventListeners.has(eventName)) {
        this.socket.off(eventName, this.eventListeners.get(eventName));
      }
      this.socket.on(eventName, callback);
      this.eventListeners.set(eventName, callback);
    }
  }

  onAnswerSubmitted(callback) {
    if (this.socket) {
      const eventName = 'answer-submitted';
      if (this.eventListeners.has(eventName)) {
        this.socket.off(eventName, this.eventListeners.get(eventName));
      }
      this.socket.on(eventName, callback);
      this.eventListeners.set(eventName, callback);
    }
  }

  onGameEnded(callback) {
    if (this.socket) {
      const eventName = 'game-ended';
      if (this.eventListeners.has(eventName)) {
        this.socket.off(eventName, this.eventListeners.get(eventName));
      }
      this.socket.on(eventName, callback);
      this.eventListeners.set(eventName, callback);
    }
  }

  onLeaderboardUpdated(callback) {
    if (this.socket) {
      const eventName = 'leaderboard-updated';
      if (this.eventListeners.has(eventName)) {
        this.socket.off(eventName, this.eventListeners.get(eventName));
      }
      this.socket.on(eventName, callback);
      this.eventListeners.set(eventName, callback);
    }
  }

  onHostDisconnected(callback) {
    if (this.socket) {
      const eventName = 'host-disconnected';
      if (this.eventListeners.has(eventName)) {
        this.socket.off(eventName, this.eventListeners.get(eventName));
      }
      this.socket.on(eventName, callback);
      this.eventListeners.set(eventName, callback);
    }
  }

  // Remove event listeners
  off(eventName, callback) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.eventListeners.clear(); // Clear tracked listeners
    }
  }

  getSocket() {
    return this.socket;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;

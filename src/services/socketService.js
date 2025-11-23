import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
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

  // Event listeners
  onPlayerJoined(callback) {
    if (this.socket) {
      this.socket.on('player-joined', callback);
    }
  }

  onPlayerLeft(callback) {
    if (this.socket) {
      this.socket.on('player-left', callback);
    }
  }

  onGameStarted(callback) {
    if (this.socket) {
      this.socket.on('game-started', callback);
    }
  }

  onQuestionChanged(callback) {
    if (this.socket) {
      this.socket.on('question-changed', callback);
    }
  }

  onAnswerSubmitted(callback) {
    if (this.socket) {
      this.socket.on('answer-submitted', callback);
    }
  }

  onGameEnded(callback) {
    if (this.socket) {
      this.socket.on('game-ended', callback);
    }
  }

  onLeaderboardUpdated(callback) {
    if (this.socket) {
      this.socket.on('leaderboard-updated', callback);
    }
  }

  onHostDisconnected(callback) {
    if (this.socket) {
      this.socket.on('host-disconnected', callback);
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
    }
  }

  getSocket() {
    return this.socket;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;

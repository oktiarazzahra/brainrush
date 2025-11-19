const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
  };
};

export const learningService = {
  // Get learning history for current user
  getLearningHistory: async () => {
    try {
      const response = await fetch(`${API_URL}/learning/history`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching learning history:', error);
      throw error;
    }
  },

  // Get detailed result of a specific learning session
  getLearningResult: async (scoreId) => {
    try {
      const response = await fetch(`${API_URL}/learning/${scoreId}`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching learning result:', error);
      throw error;
    }
  },

  // Get learning statistics
  getLearningStats: async () => {
    try {
      const response = await fetch(`${API_URL}/learning/stats`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching learning stats:', error);
      throw error;
    }
  },

  // Start a learning session
  startLearning: async (quizId) => {
    try {
      const response = await fetch(`${API_URL}/learning/start/${quizId}`, {
        method: 'POST',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error starting learning:', error);
      throw error;
    }
  },

  // Submit learning answers
  submitLearning: async (quizId, answers, progressId = null) => {
    try {
      const response = await fetch(`${API_URL}/learning/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          quizId,
          answers,
          progressId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting learning:', error);
      throw error;
    }
  },

  // Save progress for incomplete quiz
  saveProgress: async (quizId, currentQuestionIndex, answers, totalQuestions, timeLeft = null, timerMode = 'per-question', totalTimeSpent = 0) => {
    try {
      const response = await fetch(`${API_URL}/learning/save-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          quizId,
          currentQuestionIndex,
          answers,
          totalQuestions,
          timeLeft,
          timerMode,
          totalTimeSpent,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  },

  // Get saved progress for a quiz
  getProgress: async (quizId) => {
    try {
      const response = await fetch(`${API_URL}/learning/progress/${quizId}`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No progress found
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting progress:', error);
      throw error;
    }
  },
};

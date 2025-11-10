const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const quizService = {
  // ✅ GET all my quizzes
  getMyQuizzes: async () => {
    try {
      const response = await fetch(`${API_URL}/quizzes/my-quizzes`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Quiz data from backend:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching quizzes:', error);
      throw error;
    }
  },

  // ✅ CREATE new quiz
  createQuiz: async (quizData) => {
    try {
      const response = await fetch(`${API_URL}/quizzes`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Quiz created:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating quiz:', error);
      throw error;
    }
  },

  // ✅ UPDATE quiz
  updateQuiz: async (quizId, quizData) => {
    try {
      const response = await fetch(`${API_URL}/quizzes/${quizId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Quiz updated:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating quiz:', error);
      throw error;
    }
  },

  // ✅ PUBLISH quiz
  publishQuiz: async (quizId) => {
    try {
      const response = await fetch(`${API_URL}/quizzes/${quizId}/publish`, {
        method: 'PUT',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Quiz published:', data);
      return data;
    } catch (error) {
      console.error('❌ Error publishing quiz:', error);
      throw error;
    }
  },

  // ✅ UNPUBLISH quiz
  unpublishQuiz: async (quizId) => {
    try {
      const response = await fetch(`${API_URL}/quizzes/${quizId}/unpublish`, {
        method: 'PUT',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Quiz unpublished:', data);
      return data;
    } catch (error) {
      console.error('❌ Error unpublishing quiz:', error);
      throw error;
    }
  },

  // ✅ DELETE quiz
  deleteQuiz: async (quizId) => {
    try {
      const response = await fetch(`${API_URL}/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Quiz deleted:', data);
      return data;
    } catch (error) {
      console.error('❌ Error deleting quiz:', error);
      throw error;
    }
  },

  // ✅ GET single quiz by ID
  getQuizById: async (quizId) => {
    try {
      const response = await fetch(`${API_URL}/quizzes/${quizId}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Quiz fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching quiz:', error);
      throw error;
    }
  },
};

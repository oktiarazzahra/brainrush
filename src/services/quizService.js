const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
  };
};

export const quizService = {
  getPublishedQuizzes: async () => {
    try {
      const response = await fetch(`${API_URL}/quizzes/published`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching published quizzes:', error);
      throw error;
    }
  },

  getMyQuizzes: async () => {
    try {
      const response = await fetch(`${API_URL}/quizzes/my-quizzes`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  },

  createQuiz: async (quizData) => {
    try {
      const response = await fetch(`${API_URL}/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  },

  updateQuiz: async (quizId, quizData) => {
    try {
      const response = await fetch(`${API_URL}/quizzes/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  },

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
      return data;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  },

  getQuizById: async (quizId) => {
    try {
      const response = await fetch(`${API_URL}/quizzes/${quizId}`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  },

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
      return data;
    } catch (error) {
      console.error('Error publishing quiz:', error);
      throw error;
    }
  },

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
      return data;
    } catch (error) {
      console.error('Error unpublishing quiz:', error);
      throw error;
    }
  },

  setPublic: async (quizId) => {
    try {
      const response = await fetch(`${API_URL}/quizzes/${quizId}/public`, {
        method: 'PUT',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error setting quiz to public:', error);
      throw error;
    }
  },

  setPrivate: async (quizId) => {
    try {
      const response = await fetch(`${API_URL}/quizzes/${quizId}/private`, {
        method: 'PUT',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error setting quiz to private:', error);
      throw error;
    }
  },

  // DEPRECATED: Use updateQuiz with coverImage field instead
  // uploadCover: async (quizId, file) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append('cover', file);

  //     const response = await fetch(`${API_URL}/quizzes/${quizId}/cover`, {
  //       method: 'PUT',
  //       headers: getAuthHeader(),
  //       body: formData,
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     console.log('✅ Cover uploaded:', data);
  //     return data;
  //   } catch (error) {
  //     console.error('❌ Error uploading cover:', error);
  //     throw error;
  //   }
  // },

  // DEPRECATED: Use updateQuiz with coverImage: null instead
  // deleteCover: async (quizId) => {
  //   try {
  //     const response = await fetch(`${API_URL}/quizzes/${quizId}/cover`, {
  //       method: 'DELETE',
  //       headers: getAuthHeader(),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     console.log('✅ Cover deleted:', data);
  //     return data;
  //   } catch (error) {
  //     console.error('❌ Error deleting cover:', error);
  //     throw error;
  //   }
  // },
};

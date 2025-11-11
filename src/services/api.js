import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Hanya redirect ke login jika:
    // 1. Ada token (user sudah login sebelumnya)
    // 2. Token invalid/expired (401)
    // 3. BUKAN dari endpoint /auth/login atau /auth/register
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                           error.config?.url?.includes('/auth/register');
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Token expired atau invalid
      localStorage.removeItem('token');
      // Hanya redirect jika user sudah pernah login (ada token sebelumnya)
      if (localStorage.getItem('token') !== null) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

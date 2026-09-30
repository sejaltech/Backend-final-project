import api from './api';

export const authService = {
  // Register a new student
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login existing student
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Logout student
  logout() {
    localStorage.removeItem('carpool_token');
    localStorage.removeItem('carpool_user');
  },

  // Get locally stored user data
  getStoredUser() {
    const userStr = localStorage.getItem('carpool_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Get locally stored token
  getStoredToken() {
    return localStorage.getItem('carpool_token');
  }
};

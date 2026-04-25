import axios from 'axios';

const API_URL = 'http://localhost:8085/bookings/analytics';

// Create axios instance with interceptors for simulation
const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    config.headers['X-User-Id'] = user.id;
    config.headers['X-User-Role'] = user.role;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const analyticsService = {
  getSummary: async () => {
    const response = await api.get('/summary');
    return response.data;
  },

  getPopularResources: async () => {
    const response = await api.get('/popular-resources');
    return response.data;
  },

  getPeakHours: async () => {
    const response = await api.get('/peak-hours');
    return response.data;
  }
};

export default analyticsService;

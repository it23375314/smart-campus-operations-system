import axios from 'axios';

const API_URL = 'http://localhost:8085/bookings';

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

const bookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post('/', bookingData);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get('/my');
    return response.data;
  },

  getAllBookings: async (filters = {}) => {
    const response = await api.get('/', { params: filters });
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/analytics');
    return response.data;
  },

  getBookingById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  updateBooking: async (id, bookingData) => {
    const response = await api.put(`/${id}`, bookingData);
    return response.data;
  },

  deleteBooking: async (id) => {
    await api.delete(`/${id}`);
  },

  approveBooking: async (id) => {
    const response = await api.patch(`/${id}/approve`);
    return response.data;
  },

  rejectBooking: async (id, reason) => {
    const response = await api.patch(`/${id}/reject`, { reason });
    return response.data;
  },

  cancelBooking: async (id) => {
    const response = await api.patch(`/${id}/cancel`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  }
};

export default bookingService;

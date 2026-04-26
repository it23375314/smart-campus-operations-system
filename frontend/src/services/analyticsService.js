import API from './api';

const analyticsService = {
  getStats: async () => {
    const response = await API.get('/bookings/stats');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await API.get('/bookings/analytics');
    return response.data;
  }
};

export default analyticsService;

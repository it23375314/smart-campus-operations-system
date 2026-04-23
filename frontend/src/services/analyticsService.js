import API from './api';

const analyticsService = {
  getSummary: async () => {
    const response = await API.get('/bookings/analytics/summary');
    return response.data;
  },

  getPopularResources: async () => {
    const response = await API.get('/bookings/analytics/popular-resources');
    return response.data;
  },

  getPeakHours: async () => {
    const response = await API.get('/bookings/analytics/peak-hours');
    return response.data;
  }
};

export default analyticsService;

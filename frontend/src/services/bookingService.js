import API from './api';

const bookingService = {
  createBooking: async (bookingData) => {
    const response = await API.post('/bookings', bookingData);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await API.get('/bookings/my');
    return response.data;
  },

  getAllBookings: async (filters = {}) => {
    const response = await API.get('/bookings', { params: filters });
    return response.data;
  },

  getAnalytics: async () => {
    const response = await API.get('/bookings/analytics');
    return response.data;
  },

  getBookingById: async (id) => {
    const response = await API.get(`/bookings/${id}`);
    return response.data;
  },

  updateBooking: async (id, bookingData) => {
    const response = await API.put(`/bookings/${id}`, bookingData);
    return response.data;
  },

  deleteBooking: async (id) => {
    await API.delete(`/bookings/${id}`);
  },

  approveBooking: async (id) => {
    const response = await API.patch(`/bookings/${id}/approve`);
    return response.data;
  },

  rejectBooking: async (id, reason) => {
    const response = await API.patch(`/bookings/${id}/reject`, { reason });
    return response.data;
  },

  cancelBooking: async (id) => {
    const response = await API.patch(`/bookings/${id}/cancel`);
    return response.data;
  },

  getStats: async () => {
    // Note: The global API is configured with /api, so this routes to /api/bookings/stats
    const response = await API.get('/bookings/stats');
    return response.data;
  }
};

export default bookingService;

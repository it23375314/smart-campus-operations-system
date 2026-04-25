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

  getAvailability: async (resourceId, date) => {
    const response = await API.get('/bookings/availability', { params: { resourceId, date } });
    return response.data;
  },

  updateBooking: async (id, bookingData) => {
    const response = await API.put(`/bookings/${id}`, bookingData);
    return response.data;
  },

  adminCancelBooking: async (id) => {
    // We use the same cancel endpoint but since we're ADMIN, the backend will allow it
    const response = await API.patch(`/bookings/${id}/cancel`);
    return response.data;
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
  },

  downloadBookingPdf: async (id) => {
    const response = await API.get(`/bookings/${id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `booking_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  downloadReportPdf: async (filters = {}) => {
    const response = await API.get('/bookings/report/pdf', { params: filters, responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'institutional_booking_report.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};

export default bookingService;

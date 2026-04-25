import axios from 'axios';

const API_BASE = 'http://localhost:8085/api/bookings';

const availabilityService = {
  getAvailability: async (resourceId, date) => {
    try {
      const response = await axios.get(`${API_BASE}/availability`, {
        params: { resourceId, date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching availability:', error);
      throw error;
    }
  }
};

export default availabilityService;

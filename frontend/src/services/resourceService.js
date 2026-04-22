import axios from 'axios';

const API_BASE = 'http://localhost:8085/api/resources';

const resourceService = {
  getAllResources: async () => {
    try {
      const response = await axios.get(API_BASE);
      return response.data;
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  },
  getResourceById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching resource ${id}:`, error);
      throw error;
    }
  }
};

export default resourceService;

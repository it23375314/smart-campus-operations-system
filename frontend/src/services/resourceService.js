import API from './api';

const resourceService = {
  getAllResources: async () => {
    try {
      const response = await API.get('/resources');
      return response.data;
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  },
  getResourceById: async (id) => {
    try {
      const response = await API.get(`/resources/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching resource ${id}:`, error);
      throw error;
    }
  }
};

export default resourceService;

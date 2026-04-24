import API from './api';

const resourceService = {
  getAllResources: async (filters = {}) => {
    try {
      const { category, type, minCapacity, location, status } = filters;
      let url = '/resources';
      const params = new URLSearchParams();
      
      if (category) params.append('category', category);
      if (type) params.append('type', type);
      if (minCapacity) params.append('minCapacity', minCapacity);
      if (location) params.append('location', location);
      if (status) params.append('status', status);
      
      const query = params.toString();
      if (query) url += `?${query}`;
      
      const response = await API.get(url);
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

import apiClient from './apiClient';

const aiService = {
  chat: async (message) => {
    const response = await apiClient.post('/ai/chat', { message });
    return response.data;
  },

  getHistory: async () => {
    const response = await apiClient.get('/ai/history');
    return response.data;
  }
};

export default aiService;

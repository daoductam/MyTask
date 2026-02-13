import apiClient from './apiClient';

const aiService = {
  chat: async (message, image = null) => {
    const response = await apiClient.post('/ai/chat', { message, image });
    return response.data;
  },

  getHistory: async () => {
    const response = await apiClient.get('/ai/history');
    return response.data;
  },

  getInsights: async () => {
    const response = await apiClient.get('/ai/insights');
    return response.data;
  }
};

export default aiService;

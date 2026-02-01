import apiClient from './apiClient';

const dashboardService = {
  getOverview: () => {
    return apiClient.get('/dashboard/overview');
  },
  search: (query) => {
    return apiClient.get(`/dashboard/search?query=${query}`);
  },
};

export default dashboardService;

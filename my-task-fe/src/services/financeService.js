import apiClient from './apiClient';

const financeService = {
  getTransactions: (year, month, page = 0, size = 20) => {
    return apiClient.get(`/finance/transactions?year=${year}&month=${month + 1}&page=${page}&size=${size}`);
  },
  getTransactionById: (id) => {
    return apiClient.get(`/finance/transactions/${id}`);
  },
  createTransaction: (transactionData) => {
    return apiClient.post('/finance/transactions', transactionData);
  },
  updateTransaction: (id, transactionData) => {
    return apiClient.put(`/finance/transactions/${id}`, transactionData);
  },
  deleteTransaction: (id) => {
    return apiClient.delete(`/finance/transactions/${id}`);
  },
  getMonthlySummary: (year, month) => {
    return apiClient.get(`/finance/summary?year=${year}&month=${month + 1}`);
  },
  getCategories: () => {
    return apiClient.get('/finance/categories');
  },
  createCategory: (categoryData) => {
    return apiClient.post('/finance/categories', categoryData);
  },
  getTransactionsByDateRange: (startDate, endDate, page = 0, size = 20) => {
    return apiClient.get(`/finance/transactions/by-date?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`);
  },
  getCategoryStatistics: (startDate, endDate) => {
    return apiClient.get(`/finance/statistics/by-category?startDate=${startDate}&endDate=${endDate}`);
  }
};

export default financeService;

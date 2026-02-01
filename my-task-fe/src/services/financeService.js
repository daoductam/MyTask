import apiClient from './apiClient';

const financeService = {
  getTransactions: (year, month) => {
    return apiClient.get(`/finance/transactions?year=${year}&month=${month + 1}`);
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
  }
};

export default financeService;

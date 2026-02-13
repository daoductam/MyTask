import apiClient from './apiClient';

const habitService = {
  getAllHabits: (date, page = 0, size = 10) => {
    let url = `/habits?page=${page}&size=${size}`;
    if (date) url += `&date=${date}`;
    return apiClient.get(url);
  },
  getHabitById: (id) => {
    return apiClient.get(`/habits/${id}`);
  },
  createHabit: (habitData) => {
    return apiClient.post('/habits', habitData);
  },
  updateHabit: (id, habitData) => {
    return apiClient.put(`/habits/${id}`, habitData);
  },
  checkIn: (id) => {
    return apiClient.post(`/habits/${id}/checkin`);
  },
  getHabitLogs: (id, startDate, endDate) => {
    return apiClient.get(`/habits/${id}/logs?startDate=${startDate}&endDate=${endDate}`);
  },
  getGlobalLogs: (startDate, endDate) => {
    return apiClient.get(`/habits/logs?startDate=${startDate}&endDate=${endDate}`);
  },
  deleteHabit: (id) => {
    return apiClient.delete(`/habits/${id}`);
  }
};

export default habitService;

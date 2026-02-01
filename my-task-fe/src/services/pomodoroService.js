import apiClient from './apiClient';

const pomodoroService = {
  getSessions: (date) => {
    return apiClient.get(`/pomodoro/sessions?date=${date}`);
  },
  startSession: (duration, taskId = null) => {
    return apiClient.post('/pomodoro/sessions/start', { duration, taskId });
  },
  completeSession: (id) => {
    return apiClient.post(`/pomodoro/sessions/${id}/complete`);
  },
  deleteSession: (id) => {
    return apiClient.delete(`/pomodoro/sessions/${id}`);
  },
  getStats: (startDate, endDate) => {
    return apiClient.get(`/pomodoro/stats?startDate=${startDate}&endDate=${endDate}`);
  }
};

export default pomodoroService;

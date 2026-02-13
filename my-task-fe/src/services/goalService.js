import apiClient from './apiClient';

const goalService = {
  getAllGoals: (page = 0, size = 10) => {
    return apiClient.get(`/goals?page=${page}&size=${size}`);
  },
  getGoalById: (id) => {
    return apiClient.get(`/goals/${id}`);
  },
  createGoal: (goalData) => {
    return apiClient.post('/goals', goalData);
  },
  updateGoal: (id, goalData) => {
    return apiClient.put(`/goals/${id}`, goalData);
  },
  deleteGoal: (id) => {
    return apiClient.delete(`/goals/${id}`);
  },
  addMilestone: (goalId, title) => {
    return apiClient.post(`/goals/${goalId}/milestones`, { title });
  },
  toggleMilestone: (milestoneId) => {
    return apiClient.patch(`/goals/milestones/${milestoneId}/toggle`);
  },
  deleteMilestone: (milestoneId) => {
    return apiClient.delete(`/goals/milestones/${milestoneId}`);
  }
};

export default goalService;

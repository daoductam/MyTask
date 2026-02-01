import apiClient from './apiClient';

const taskService = {
  getTasks: (projectId) => {
    return apiClient.get(`/tasks/project/${projectId}`);
  },
  getKanbanTasks: () => {
    return apiClient.get('/tasks/kanban');
  },
  getTaskById: (id) => {
    return apiClient.get(`/tasks/${id}`);
  },
  createTask: (taskData) => {
    return apiClient.post('/tasks', taskData);
  },
  updateTask: (id, taskData) => {
    return apiClient.put(`/tasks/${id}`, taskData);
  },
  updateTaskStatus: (id, status, position) => {
    return apiClient.patch(`/tasks/${id}/status?status=${status}${position !== undefined ? `&position=${position}` : ''}`);
  },
  deleteTask: (id) => {
    return apiClient.delete(`/tasks/${id}`);
  }
};

export default taskService;

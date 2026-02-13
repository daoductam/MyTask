import apiClient from './apiClient';

const projectService = {
  getProjects: (status, page = 0, size = 10) => {
    let url = `/projects?page=${page}&size=${size}`;
    if (status && status !== 'ALL') {
      url += `&status=${status}`;
    }
    return apiClient.get(url);
  },
  getProjectById: (id) => {
    return apiClient.get(`/projects/${id}`);
  },
  getKanbanTasks: (projectId) => {
    return apiClient.get(`/tasks/project/${projectId}/kanban`);
  },
  createProject: (projectData) => {
    return apiClient.post('/projects', projectData);
  },
  updateProject: (id, projectData) => {
    return apiClient.put(`/projects/${id}`, projectData);
  },
  deleteProject: (id) => {
    return apiClient.delete(`/projects/${id}`);
  }
};

export default projectService;

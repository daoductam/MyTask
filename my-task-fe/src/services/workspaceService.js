import apiClient from './apiClient';

const workspaceService = {
  getAllWorkspaces: (page = 0, size = 10) => {
    return apiClient.get(`/workspaces?page=${page}&size=${size}`);
  },
  getWorkspaceById: (id) => {
    return apiClient.get(`/workspaces/${id}`);
  },
  createWorkspace: (workspaceData) => {
    return apiClient.post('/workspaces', workspaceData);
  },
  updateWorkspace: (id, workspaceData) => {
    return apiClient.put(`/workspaces/${id}`, workspaceData);
  },
  deleteWorkspace: (id) => {
    return apiClient.delete(`/workspaces/${id}`);
  }
};

export default workspaceService;

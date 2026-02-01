import apiClient from './apiClient';

const workspaceService = {
  getAllWorkspaces: () => {
    return apiClient.get('/workspaces');
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

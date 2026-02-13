import apiClient from './apiClient';

const noteService = {
  getAllNotes: (page = 0, size = 20) => {
    return apiClient.get(`/notes?page=${page}&size=${size}`);
  },
  getNotesByFolder: (folderId, page = 0, size = 20) => {
    return apiClient.get(folderId ? `/notes/folder/${folderId}?page=${page}&size=${size}` : `/notes/folder/0?page=${page}&size=${size}`);
  },
  getNoteById: (id) => {
    return apiClient.get(`/notes/${id}`);
  },
  createNote: (noteData) => {
    return apiClient.post('/notes', noteData);
  },
  updateNote: (id, noteData) => {
    return apiClient.put(`/notes/${id}`, noteData);
  },
  togglePin: (id) => {
    return apiClient.patch(`/notes/${id}/pin`);
  },
  deleteNote: (id) => {
    return apiClient.delete(`/notes/${id}`);
  },
  getAllFolders: () => {
    return apiClient.get('/notes/folders');
  },
  createFolder: (name) => {
    return apiClient.post('/notes/folders', { name });
  },
  deleteFolder: (id) => {
    return apiClient.delete(`/notes/folders/${id}`);
  }
};

export default noteService;

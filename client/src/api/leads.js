import api from './axios';

export const leadsApi = {
  getAll: (params) => api.get('/leads', { params }),
  getOne: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  bulkUpdate: (data) => api.put('/leads/bulk-update', data),
  addNote: (id, text) => api.post(`/leads/${id}/notes`, { text }),
};

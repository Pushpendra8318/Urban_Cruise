import api from './axios';

export const campaignsApi = {
  getAll: () => api.get('/campaigns'),
  getSources: () => api.get('/campaigns/sources'),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`),
};

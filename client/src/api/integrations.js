import api from './axios';

export const integrationsApi = {
  getStatus: () => api.get('/integrations/status'),
  syncGoogle: () => api.post('/integrations/google/sync'),
  getApiKeys: () => api.get('/integrations/api-keys'),
  createApiKey: (name) => api.post('/integrations/api-keys', { name }),
  revokeApiKey: (id) => api.delete(`/integrations/api-keys/${id}`),
};

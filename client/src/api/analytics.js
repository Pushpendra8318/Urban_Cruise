import api from './axios';

export const analyticsApi = {
  getSummary: () => api.get('/analytics/summary'),
  getBySource: () => api.get('/analytics/by-source'),
  getOverTime: (period) => api.get('/analytics/over-time', { params: { period } }),
  getFunnel: () => api.get('/analytics/funnel'),
  getCampaigns: () => api.get('/analytics/campaigns'),
};

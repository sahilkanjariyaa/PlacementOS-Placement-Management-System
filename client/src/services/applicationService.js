import api from './api.js';

export const applicationService = {
  applyToDrive: async (driveId) => {
    const response = await api.post(`/applications/${driveId}`);
    return response.data;
  },

  getMyApplications: async () => {
    const response = await api.get('/applications/my');
    return response.data;
  },

  getApplications: async (params = {}) => {
    const response = await api.get('/applications', { params });
    return response.data;
  },

  getApplicationById: async (id) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  updateApplicationStatus: async (id, statusData) => {
    const response = await api.put(`/applications/${id}/status`, statusData);
    return response.data;
  },
};

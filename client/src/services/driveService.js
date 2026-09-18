import api from './api.js';

export const driveService = {
  getDrives: async (params = {}) => {
    const response = await api.get('/drives', { params });
    return response.data;
  },

  getEligibleDrives: async () => {
    const response = await api.get('/drives/eligible');
    return response.data;
  },

  getDriveById: async (id) => {
    const response = await api.get(`/drives/${id}`);
    return response.data;
  },

  createDrive: async (driveData) => {
    const response = await api.post('/drives', driveData);
    return response.data;
  },

  updateDrive: async (id, driveData) => {
    const response = await api.put(`/drives/${id}`, driveData);
    return response.data;
  },

  deleteDrive: async (id) => {
    const response = await api.delete(`/drives/${id}`);
    return response.data;
  },
};

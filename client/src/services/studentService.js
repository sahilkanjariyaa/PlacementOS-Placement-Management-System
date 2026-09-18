import api from './api.js';

export const studentService = {
  getProfile: async () => {
    const response = await api.get('/students/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/students/profile', profileData);
    return response.data;
  },

  getAllStudents: async (params = {}) => {
    const response = await api.get('/students', { params });
    return response.data;
  },

  getStudentById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  updateStudentStatus: async (id, statusData) => {
    const response = await api.put(`/students/${id}/status`, statusData);
    return response.data;
  },
};

import api from './api.js';

export const reportService = {
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/reports/analytics');
    return response.data;
  },

  downloadPlacementReport: () => {
    const token = localStorage.getItem('token');
    const url = `${import.meta.env.VITE_API_URL || '/api'}/reports/export`;
    // Trigger browser file download
    window.open(url, '_blank');
  },
};

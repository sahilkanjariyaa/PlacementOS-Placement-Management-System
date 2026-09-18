import api from './api.js';

export const authService = {
  requestSignupOtp: async (name, email, role = 'student') => {
    const response = await api.post('/auth/request-signup-otp', { name, email, role });
    return response.data;
  },

  verifySignupOtp: async (signupData) => {
    const response = await api.post('/auth/verify-signup-otp', signupData);
    return response.data;
  },

  requestLoginOtp: async (email, expectedRole = null) => {
    const response = await api.post('/auth/request-login-otp', { email, expectedRole });
    return response.data;
  },

  verifyLoginOtp: async (email, otp) => {
    const response = await api.post('/auth/verify-login-otp', { email, otp });
    return response.data;
  },

  resendOtp: async (email, purpose) => {
    const response = await api.post('/auth/resend-otp', { email, purpose });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

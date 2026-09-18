import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from server on app mount
  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const res = await authService.getMe();
        if (res.success) {
          setUser(res.data.user);
          setProfile(res.data.profile);
        }
      }
    } catch (err) {
      console.log('[Auth] Session check failed or unauthenticated');
      localStorage.removeItem('token');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const requestSignupOtp = async (name, email, role = 'student') => {
    return await authService.requestSignupOtp(name, email, role);
  };

  const verifySignupOtp = async (signupData) => {
    const res = await authService.verifySignupOtp(signupData);
    if (res.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      await checkAuth();
    }
    return res;
  };

  const requestLoginOtp = async (email, expectedRole = null) => {
    return await authService.requestLoginOtp(email, expectedRole);
  };

  const verifyLoginOtp = async (email, otp) => {
    const res = await authService.verifyLoginOtp(email, otp);
    if (res.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      await checkAuth();
    }
    return res;
  };

  const resendOtp = async (email, purpose) => {
    return await authService.resendOtp(email, purpose);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setProfile(null);
      window.location.href = '/login';
    }
  };

  const updateLocalProfile = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        requestSignupOtp,
        verifySignupOtp,
        requestLoginOtp,
        verifyLoginOtp,
        resendOtp,
        logout,
        refreshUser: checkAuth,
        updateLocalProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

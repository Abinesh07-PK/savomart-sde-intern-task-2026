import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('savo_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user details if token exists
  const fetchProfile = async (currentToken) => {
    try {
      setLoading(true);
      const response = await client.get('/api/profile/me', {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // In case token is bad on initialization, clear it
      logout(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  // Request Mock OTP code
  const requestOtp = async (mobileNumber) => {
    try {
      // Clean input number (remove non-digits)
      const cleanNumber = mobileNumber.replace(/\D/g, '');
      const response = await client.post('/api/auth/request-otp', {
        mobile_number: cleanNumber,
      });
      return response.data; // { message, dev_otp }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to send OTP. Please check the number.';
      toast.error(errorMsg);
      throw error;
    }
  };

  // Verify OTP and save Token
  const verifyOtp = async (mobileNumber, otp) => {
    try {
      // Clean number before verification
      const cleanNumber = mobileNumber.replace(/\D/g, '');
      const response = await client.post('/api/auth/verify-otp', {
        mobile_number: cleanNumber,
        otp: otp,
      });
      const receivedToken = response.data.access_token;
      
      localStorage.setItem('savo_token', receivedToken);
      setToken(receivedToken);
      
      toast.success('Successfully logged in! 🎉');
      // fetchProfile will be triggered by useEffect due to token state change
      return receivedToken;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Verification failed. Please try again.';
      toast.error(errorMsg);
      throw error;
    }
  };

  // Update profile details inline
  const updateProfile = async (name, email) => {
    try {
      const response = await client.put('/api/profile/me', { name, email });
      setUser(response.data);
      toast.success('Profile updated successfully!');
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to update profile.';
      toast.error(errorMsg);
      throw error;
    }
  };

  // Force trigger user profile refresh (e.g. after earning points or logging tickets)
  const refreshUser = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  // Logout utility
  const logout = (showToast = true) => {
    localStorage.removeItem('savo_token');
    setToken(null);
    setUser(null);
    if (showToast) {
      toast.success('Successfully logged out. Goodbye! 👋');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        user,
        loading,
        requestOtp,
        verifyOtp,
        updateProfile,
        refreshUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

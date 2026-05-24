import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Append JWT token automatically if present in localStorage
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('savo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 globally, clear credentials, notify, and redirect
client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentToken = localStorage.getItem('savo_token');
      if (currentToken) {
        // Clear tokens
        localStorage.removeItem('savo_token');
        
        // Notify session expired
        toast.error('Session expired. Please log in again.', {
          id: 'session-expired-toast', // prevent toast spamming
        });
        
        // Wait briefly for the toast to be seen, then redirect
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }
    return Promise.reject(error);
  }
);

export default client;

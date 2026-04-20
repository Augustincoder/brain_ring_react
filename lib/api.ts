import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const storage = localStorage.getItem('user-storage');
      if (storage) {
        const parsed = JSON.parse(storage);
        if (parsed?.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
        }
      }
    } catch (e) {
      console.error('Error reading token from localStorage', e);
    }
  }
  return config;
});

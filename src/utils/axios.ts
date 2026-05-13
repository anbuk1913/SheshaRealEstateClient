import axios from 'axios';
import { store } from '../app/store';
import { logout } from '../features/auth/authSlice';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = '/'
    }
    return Promise.reject(err.response?.data || err);
  }
);

export default api;
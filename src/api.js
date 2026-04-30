import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';
const socket = io('http://localhost:5000');

const api = axios.create({
  baseURL: API_URL,
});

// Inject token into requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const logisticsAPI = {
  getTrucks: (ownerId) => api.get('/trucks', { params: { ownerId } }),
  addTruck: (data) => api.post('/trucks', data),
  postCargo: (data) => api.post('/cargo', data),
  createBooking: (data) => api.post('/bookings', data),
  updateBooking: (id, data) => api.patch(`/bookings/${id}`, data),
};

export { socket };
export default api;

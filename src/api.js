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
  updateProfile: (data) => api.patch('/auth/me', data),
};

export const logisticsAPI = {
  getTrucks: (ownerId) => api.get('/trucks', { params: { ownerId } }),
  addTruck: (data) => api.post('/trucks', data),
  updateTruck: (id, data) => api.patch(`/trucks/${id}`, data),
  deleteTruck: (id) => api.delete(`/trucks/${id}`),
  getCargo: (params) => api.get('/cargo', { params }),
  postCargo: (data) => api.post('/cargo', data),
  updateCargo: (id, data) => api.patch(`/cargo/${id}`, data),
  deleteCargo: (id) => api.delete(`/cargo/${id}`),
  getBookings: (params) => api.get('/bookings', { params }),
  createBooking: (data) => api.post('/bookings', data),
  updateBooking: (id, data) => api.patch(`/bookings/${id}`, data),
  completeBooking: (id) => api.post(`/bookings/${id}/complete`),
  getComplaints: () => api.get('/complaints'),
  postComplaint: (data) => api.post('/complaints', data),
  updateComplaint: (id, data) => api.patch(`/complaints/${id}`, data),
  getNotifications: () => api.get('/notifications'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/users'),
  updateUserStatus: (id, status) => api.patch(`/users/${id}`, { status }),
};

export { socket };
export default api;

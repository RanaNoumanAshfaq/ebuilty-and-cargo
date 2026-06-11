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
  getTrucks: (params) => api.get('/trucks', { params }),
  addTruck: (data) => api.post('/trucks', data),
  updateTruck: (id, data) => api.patch(`/trucks/${id}`, data),
  deleteTruck: (id) => api.delete(`/trucks/${id}`),
  getCargo: (params) => api.get('/cargo', { params }),
  postCargo: (data) => api.post('/cargo', data),
  updateCargo: (id, data) => api.patch(`/cargo/${id}`, data),
  respondToCargo: (id, data) => api.patch(`/cargo/${id}/respond`, data),
  deleteCargo: (id) => api.delete(`/cargo/${id}`),
  getBookings: (params) => api.get('/bookings', { params }),
  createBooking: (data) => api.post('/bookings', data),
  updateBooking: (id, data) => api.patch(`/bookings/${id}`, data),
  completeBooking: (id, data) => api.post(`/bookings/${id}/complete`, data),
  getComplaints: () => api.get('/complaints'),
  postComplaint: (data) => api.post('/complaints', data),
  updateComplaint: (id, data) => api.patch(`/complaints/${id}`, data),
  getNotifications: () => api.get('/notifications'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  getTransporters: () => api.get('/users', { params: { role: 'transporter' } }),
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.url;
  },
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/users'),
  updateUserStatus: (id, status, reason) => api.patch(`/users/${id}`, { status, reason }),
  getShipments: () => api.get('/admin/shipments'),
  getActivity: () => api.get('/admin/activity'),
};

export { socket };
export default api;

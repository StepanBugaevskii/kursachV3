import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const usersApi = {
  getAll: () => api.get('/users'),
  getOne: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const peersApi = {
  register: (data: any) => api.post('/peers/register', data),
  getAll: () => api.get('/peers'),
  getOnline: () => api.get('/peers/online'),
  getOne: (peerId: string) => api.get(`/peers/${peerId}`),
  markOnline: (peerId: string) => api.post(`/peers/${peerId}/online`),
  markOffline: (peerId: string) => api.post(`/peers/${peerId}/offline`),
};

export const filesApi = {
  getAll: (ownerId?: string) => api.get('/files', { params: { ownerId } }),
  getOne: (id: string) => api.get(`/files/${id}`),
  create: (data: any) => api.post('/files', data),
  update: (id: string, data: any) => api.put(`/files/${id}`, data),
  delete: (id: string) => api.delete(`/files/${id}`),
};

export const chunksApi = {
  getByFile: (fileId: string) => api.get('/chunks', { params: { fileId } }),
  getProviders: (chunkId: string) => api.get(`/chunks/${chunkId}/providers`),
  create: (data: any) => api.post('/chunks', data),
  addReplica: (data: any) => api.post('/chunks/replicas', data),
};

export default api;

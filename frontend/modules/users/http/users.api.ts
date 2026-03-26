import api from '@/lib/api';

export interface User {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  displayName: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get('/users');
    return data;
  },

  getOne: async (id: string): Promise<User> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  create: async (userData: CreateUserDto): Promise<User> => {
    const { data } = await api.post('/users', userData);
    return data;
  },

  update: async (id: string, userData: Partial<User>): Promise<User> => {
    const { data } = await api.put(`/users/${id}`, userData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

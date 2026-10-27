import api from './api';
import { User } from '../types';

export const userService = {
  getUsers: async (params?: { role?: string; department?: string; search?: string }): Promise<{ success: boolean; count: number; users: User[] }> => {
    const res = await api.get('/users', { params });
    return res.data;
  },

  getUserById: async (id: string): Promise<{ success: boolean; user: User; stats?: any }> => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  createUser: async (userData: any): Promise<{ success: boolean; user: User }> => {
    const res = await api.post('/users', userData);
    return res.data;
  },

  updateUser: async (id: string, userData: any): Promise<{ success: boolean; user: User }> => {
    const res = await api.put(`/users/${id}`, userData);
    return res.data;
  },

  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};

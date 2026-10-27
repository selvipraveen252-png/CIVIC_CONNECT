import api from './api';
import { User } from '../types';

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}

export const authService = {
  register: async (formData: { name: string; email: string; password: string; phone?: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', formData);
    return res.data;
  },

  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  },

  getMe: async (): Promise<{ success: boolean; user: User }> => {
    const res = await api.get<{ success: boolean; user: User }>('/auth/me');
    return res.data;
  },

  updateProfile: async (data: FormData): Promise<{ success: boolean; user: User }> => {
    const res = await api.put<{ success: boolean; user: User }>('/auth/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

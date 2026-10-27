import api from './api';
import { Department, User } from '../types';

export const departmentService = {
  getDepartments: async (): Promise<{ success: boolean; count: number; departments: Department[] }> => {
    const res = await api.get('/departments');
    return res.data;
  },

  getDepartmentById: async (id: string): Promise<{ success: boolean; department: Department; officers: User[] }> => {
    const res = await api.get(`/departments/${id}`);
    return res.data;
  },

  createDepartment: async (data: { name: string; description: string; contactEmail: string; contactPhone: string }): Promise<{ success: boolean; department: Department }> => {
    const res = await api.post('/departments', data);
    return res.data;
  },

  updateDepartment: async (id: string, data: Partial<Department>): Promise<{ success: boolean; department: Department }> => {
    const res = await api.put(`/departments/${id}`, data);
    return res.data;
  },

  deleteDepartment: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/departments/${id}`);
    return res.data;
  },
};

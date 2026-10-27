import api from './api';
import { Issue, IssueStatus, IssuePriority } from '../types';

export interface IssueFilterParams {
  category?: string;
  status?: string;
  priority?: string;
  department?: string;
  officer?: string;
  search?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export const issueService = {
  createIssue: async (formData: FormData): Promise<{ success: boolean; issue: Issue }> => {
    const res = await api.post<{ success: boolean; issue: Issue }>('/issues', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getIssues: async (params?: IssueFilterParams): Promise<{ success: boolean; total: number; page: number; pages: number; issues: Issue[] }> => {
    const res = await api.get('/issues', { params });
    return res.data;
  },

  getMyIssues: async (): Promise<{ success: boolean; count: number; issues: Issue[] }> => {
    const res = await api.get('/issues/my');
    return res.data;
  },

  getIssueById: async (id: string): Promise<{ success: boolean; issue: Issue }> => {
    const res = await api.get<{ success: boolean; issue: Issue }>(`/issues/${id}`);
    return res.data;
  },

  updateIssue: async (id: string, formData: FormData): Promise<{ success: boolean; issue: Issue }> => {
    const res = await api.put<{ success: boolean; issue: Issue }>(`/issues/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteIssue: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete<{ success: boolean; message: string }>(`/issues/${id}`);
    return res.data;
  },

  updateStatus: async (
    id: string,
    data: { status: IssueStatus; remarks?: string; evidenceImage?: File | string }
  ): Promise<{ success: boolean; issue: Issue }> => {
    const formData = new FormData();
    formData.append('status', data.status);
    if (data.remarks) formData.append('remarks', data.remarks);
    if (data.evidenceImage instanceof File) {
      formData.append('evidenceImage', data.evidenceImage);
    } else if (typeof data.evidenceImage === 'string') {
      formData.append('evidenceImage', data.evidenceImage);
    }

    const res = await api.patch<{ success: boolean; issue: Issue }>(`/issues/${id}/status`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  assignIssue: async (
    id: string,
    data: { departmentId?: string; officerId?: string; priority?: IssuePriority; remarks?: string }
  ): Promise<{ success: boolean; issue: Issue }> => {
    const res = await api.patch<{ success: boolean; issue: Issue }>(`/issues/${id}/assign`, data);
    return res.data;
  },

  reopenIssue: async (id: string, remarks?: string): Promise<{ success: boolean; issue: Issue }> => {
    const res = await api.post<{ success: boolean; issue: Issue }>(`/issues/${id}/reopen`, { remarks });
    return res.data;
  },
};

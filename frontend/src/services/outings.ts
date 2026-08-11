import { api } from './api';
import { OutingCreateData, OutingRequest, ApprovalHistory } from '../types';

export const outingService = {
  // Student API
  async createOuting(data: OutingCreateData): Promise<OutingRequest> {
    const response = await api.post<OutingRequest>('/outings', data);
    return response.data;
  },

  async getMyOutings(): Promise<OutingRequest[]> {
    const response = await api.get<OutingRequest[]>('/outings/my');
    return response.data;
  },

  async getOutingById(id: number): Promise<OutingRequest> {
    const response = await api.get<OutingRequest>(`/outings/${id}`);
    return response.data;
  },

  async cancelOuting(id: number): Promise<OutingRequest> {
    const response = await api.post<OutingRequest>(`/outings/${id}/cancel`);
    return response.data;
  },

  async getOutingHistory(id: number): Promise<ApprovalHistory[]> {
    const response = await api.get<ApprovalHistory[]>(`/outings/${id}/history`);
    return response.data;
  },

  // HOD API
  async getHodPendingOutings(): Promise<OutingRequest[]> {
    const response = await api.get<OutingRequest[]>('/hod/outings/pending');
    return response.data;
  },

  async hodApprove(id: number, comment?: string): Promise<OutingRequest> {
    const response = await api.post<OutingRequest>(`/hod/outings/${id}/approve`, { comment });
    return response.data;
  },

  async hodReject(id: number, comment?: string): Promise<OutingRequest> {
    const response = await api.post<OutingRequest>(`/hod/outings/${id}/reject`, { comment });
    return response.data;
  },

  // Warden API
  async getWardenPendingOutings(): Promise<OutingRequest[]> {
    const response = await api.get<OutingRequest[]>('/warden/outings/pending');
    return response.data;
  },

  async wardenConfirmParent(id: number): Promise<OutingRequest> {
    const response = await api.post<OutingRequest>(`/warden/outings/${id}/parent-confirmation`, {
      parent_approval_confirmed: true,
    });
    return response.data;
  },

  async wardenApprove(id: number, comment?: string): Promise<OutingRequest> {
    const response = await api.post<OutingRequest>(`/warden/outings/${id}/approve`, { comment });
    return response.data;
  },

  async wardenReject(id: number, comment?: string): Promise<OutingRequest> {
    const response = await api.post<OutingRequest>(`/warden/outings/${id}/reject`, { comment });
    return response.data;
  },

  // Watchman API
  async getWatchmanTodaysOutings(): Promise<OutingRequest[]> {
    const response = await api.get<OutingRequest[]>('/watchman/outings/today');
    return response.data;
  },

  async watchmanSearchOutings(query: string): Promise<OutingRequest[]> {
    const response = await api.get<OutingRequest[]>('/watchman/outings/search', {
      params: { query },
    });
    return response.data;
  },

  async watchmanRecordExit(id: number): Promise<OutingRequest> {
    const response = await api.post<OutingRequest>(`/watchman/outings/${id}/exit`);
    return response.data;
  },

  async watchmanRecordReturn(id: number): Promise<OutingRequest> {
    const response = await api.post<OutingRequest>(`/watchman/outings/${id}/return`);
    return response.data;
  },

  async getWatchmanStudents(params?: { search?: string; department_id?: number; hostel_block_id?: number }): Promise<import('../types').StudentDirectoryItem[]> {
    const response = await api.get<import('../types').StudentDirectoryItem[]>('/watchman/students', { params });
    return response.data;
  },

  async getHodHistory(params?: { search?: string; status_filter?: string; hostel_block_id?: number }): Promise<OutingRequest[]> {
    const response = await api.get<OutingRequest[]>('/hod/history', { params });
    return response.data;
  },

  async getWardenHistory(params?: { search?: string; status_filter?: string; department_id?: number }): Promise<OutingRequest[]> {
    const response = await api.get<OutingRequest[]>('/warden/history', { params });
    return response.data;
  },

  async getDepartments(): Promise<import('../types').Department[]> {
    const response = await api.get<import('../types').Department[]>('/departments');
    return response.data;
  },

  async getHostelBlocks(): Promise<import('../types').HostelBlock[]> {
    const response = await api.get<import('../types').HostelBlock[]>('/hostel-blocks');
    return response.data;
  },
};




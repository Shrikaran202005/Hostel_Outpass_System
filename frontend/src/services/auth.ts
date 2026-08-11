import { api } from './api';
import { AuthResponse, Department, HostelBlock, SignupData, User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    const data = response.data;
    localStorage.setItem('token', data.access_token);
    const userObj: User = {
      id: data.user_id,
      name: data.name,
      email: data.email,
      role: data.role,
      register_number: data.register_number,
      department_id: data.department_id,
      department_code: data.department_code,
      department_name: data.department_name,
      department: data.department_code ? { id: data.department_id || 0, code: data.department_code, name: data.department_name || '' } : undefined,
      hostel_block_id: data.hostel_block_id,
      hostel_block_name: data.hostel_block_name,
      hostel_block: data.hostel_block_name ? { id: data.hostel_block_id || 0, name: data.hostel_block_name } : undefined,
      year: data.year,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('user', JSON.stringify(userObj));
    return data;
  },

  async signup(signupData: SignupData): Promise<User> {
    const response = await api.post<User>('/auth/signup', signupData);
    return response.data;
  },

  async getDepartments(): Promise<Department[]> {
    const response = await api.get<Department[]>('/departments');
    return response.data;
  },

  async getHostelBlocks(): Promise<HostelBlock[]> {
    const response = await api.get<HostelBlock[]>('/hostel-blocks');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },
};


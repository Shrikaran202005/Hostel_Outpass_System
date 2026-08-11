export type Role = 'STUDENT' | 'HOD' | 'WARDEN' | 'WATCHMAN';

export type OutingStatus =
  | 'PENDING_HOD'
  | 'PENDING_WARDEN'
  | 'PENDING_WARDEN_ASSIGNMENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXITED'
  | 'COMPLETED'
  | 'LATE_RETURN';


export type ApprovalAction =
  | 'SUBMITTED'
  | 'HOD_APPROVED'
  | 'HOD_REJECTED'
  | 'WARDEN_APPROVED'
  | 'WARDEN_REJECTED'
  | 'PARENT_APPROVAL_CONFIRMED'
  | 'CANCELLED'
  | 'EXIT_RECORDED'
  | 'RETURN_RECORDED'
  | 'LATE_RETURN_DETECTED'
  | 'COMPLETED';

export interface Department {
  id: number;
  name: string;
  code: string;
}

export interface HostelBlock {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  register_number?: string;
  email: string;
  role: Role;
  department_id?: number;
  department_code?: string;
  department_name?: string;
  department?: Department;
  hostel_block_id?: number;
  hostel_block_name?: string;
  hostel_block?: HostelBlock;
  year?: number;
  hostel?: string;
  room_number?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  name: string;
  email: string;
  role: Role;
  register_number?: string;
  department_id?: number;
  department_code?: string;
  department_name?: string;
  hostel_block_id?: number;
  hostel_block_name?: string;
  year?: number;
}

export interface ApprovalHistory {
  id: number;
  outing_id: number;
  actor_id: number;
  actor_role: Role;
  action: ApprovalAction;
  comment?: string;
  timestamp: string;
  actor_name?: string;
}

export interface GateLog {
  id: number;
  outing_id: number;
  watchman_id: number;
  exit_time?: string;
  return_time?: string;
  status: string;
  created_at: string;
}

export interface OutingRequest {
  id: number;
  student_id: number;
  outing_date: string;
  leaving_time: string;
  expected_return_time: string;
  destination: string;
  reason: string;
  status: OutingStatus;
  parent_approval_confirmed: boolean;
  created_at: string;
  updated_at: string;
  student?: User;
  history_records?: ApprovalHistory[];
  gate_logs?: GateLog[];
}

export interface OutingCreateData {
  outing_date: string;
  leaving_time: string;
  expected_return_time: string;
  destination: string;
  reason: string;
}

export interface SignupData {
  role: Role;
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  register_number?: string;
  department_id?: number;
  year?: number;
  hostel_block_id?: number;
  room_number?: string;
}

export interface StudentDirectoryItem {
  id: number;
  name: string;
  register_number?: string;
  email: string;
  department_id?: number;
  department_name?: string;
  department_code?: string;
  hostel_block_id?: number;
  hostel_block_name?: string;
  room_number?: string;
  year?: number;
  current_outing_status: string;
  active_outing?: OutingRequest;
}




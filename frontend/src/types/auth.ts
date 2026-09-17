export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'Physician' | 'Nurse' | 'Administrator';
  hospital_name: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  role: 'Physician' | 'Nurse' | 'Administrator';
  hospital_name?: string;
}

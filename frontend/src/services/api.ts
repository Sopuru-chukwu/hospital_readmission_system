import axios from 'axios';
import type { 
  ReadmissionPredictionRequest, 
  ReadmissionPredictionResponse, 
  SamplePatientCase,
  PatientHistoryRecord
} from '../types/prediction';
import type { LoginPayload, RegisterPayload, AuthResponse, User } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Helper for auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('diapredict_token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const api = {
  // Auth API
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, payload);
    if (response.data.access_token) {
      localStorage.setItem('diapredict_token', response.data.access_token);
      localStorage.setItem('diapredict_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/register`, payload);
    if (response.data.access_token) {
      localStorage.setItem('diapredict_token', response.data.access_token);
      localStorage.setItem('diapredict_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await axios.get<User>(`${API_BASE_URL}/auth/me`, getAuthHeaders());
    return response.data;
  },

  logout() {
    localStorage.removeItem('diapredict_token');
    localStorage.removeItem('diapredict_user');
  },

  // Prediction API
  async predictReadmission(data: ReadmissionPredictionRequest): Promise<ReadmissionPredictionResponse> {
    const response = await axios.post<ReadmissionPredictionResponse>(`${API_BASE_URL}/predict`, data, getAuthHeaders());
    return response.data;
  },

  async predictBatchReadmission(data: ReadmissionPredictionRequest[]): Promise<ReadmissionPredictionResponse[]> {
    const response = await axios.post<ReadmissionPredictionResponse[]>(`${API_BASE_URL}/predict/batch`, data, getAuthHeaders());
    return response.data;
  },

  async getSampleCases(): Promise<SamplePatientCase[]> {
    const response = await axios.get<SamplePatientCase[]>(`${API_BASE_URL}/predict/sample-cases`);
    return response.data;
  },

  async getPredictionHistory(limit: number = 50): Promise<PatientHistoryRecord[]> {
    const response = await axios.get<PatientHistoryRecord[]>(`${API_BASE_URL}/predict/history?limit=${limit}`, getAuthHeaders());
    return response.data;
  },

  async checkHealth(): Promise<{ status: string }> {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  }
};

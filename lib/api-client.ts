/**
 * API Client for Backend Communication
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api/v1`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async register(email: string, password: string, full_name: string) {
    const response = await this.client.post('/auth/register', { email, password, full_name });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async logout() {
    await this.client.post('/auth/logout');
  }

  // Energy
  async getConsumption(zone?: string) {
    const response = await this.client.get('/energy/consumption', { params: { zone } });
    return response.data;
  }

  async getSolarProduction() {
    const response = await this.client.get('/energy/solar');
    return response.data;
  }

  async getBatteryStatus() {
    const response = await this.client.get('/energy/battery');
    return response.data;
  }

  async getDashboard() {
    const response = await this.client.get('/energy/dashboard');
    return response.data;
  }

  async getEnergyAnalytics(period: string = 'daily') {
    const response = await this.client.get('/energy/analytics', { params: { period } });
    return response.data;
  }

  // Lighting
  async controlLights(zone: string, action: string, brightness?: number) {
    const response = await this.client.post('/lighting/control', {
      zone,
      action,
      brightness,
    });
    return response.data;
  }

  async getLightStatus(zone?: string) {
    const url = zone ? `/lighting/status/${zone}` : '/lighting/status';
    const response = await this.client.get(url);
    return response.data;
  }

  // Complaints
  async createComplaint(data: any) {
    const response = await this.client.post('/complaints/', data);
    return response.data;
  }

  async getComplaints(status?: string, zone?: string) {
    const response = await this.client.get('/complaints/', {
      params: { status_filter: status, zone },
    });
    return response.data;
  }

  async getComplaint(id: string) {
    const response = await this.client.get(`/complaints/${id}`);
    return response.data;
  }

  async updateComplaint(id: string, data: any) {
    const response = await this.client.patch(`/complaints/${id}`, data);
    return response.data;
  }

  // Chat
  async sendChatMessage(message: string, history: any[] = [], sessionId?: string) {
    const response = await this.client.post('/chat/message', {
      message,
      history,
      session_id: sessionId
    });
    return response.data;
  }

  async getChatCapabilities() {
    const response = await this.client.get('/chat/capabilities');
    return response.data;
  }

  async getChatExamples() {
    const response = await this.client.get('/chat/examples');
    return response.data;
  }

  // Users
  async getUsers() {
    const response = await this.client.get('/users/');
    return response.data;
  }

  async getUser(id: string) {
    const response = await this.client.get(`/users/${id}`);
    return response.data;
  }

  async updateUser(id: string, data: any) {
    const response = await this.client.patch(`/users/${id}`, data);
    return response.data;
  }

  // Admin
  async getStats() {
    const response = await this.client.get('/admin/stats');
    return response.data;
  }

  async changeUserRole(userId: string, newRole: string) {
    const response = await this.client.post(`/admin/roles/${userId}`, null, {
      params: { new_role: newRole },
    });
    return response.data;
  }

  // Analytics
  async getAnalytics(period: string = 'daily', zone?: string) {
    const response = await this.client.get('/analytics/energy', {
      params: { period, zone },
    });
    return response.data;
  }

  async getSummaryReport() {
    const response = await this.client.get('/analytics/reports/summary');
    return response.data;
  }
}

export const apiClient = new APIClient();
export default apiClient;

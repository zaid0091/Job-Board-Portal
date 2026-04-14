import axiosInstance from './axiosInstance';
import type { LoginCredentials, RegisterData, AuthResponse, User, ChangePasswordData } from '@/types';

export const authAPI = {
  login: async (credentials: LoginCredentials) => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login/', credentials);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await axiosInstance.post<AuthResponse>('/auth/register/', data);
    return response.data;
  },

  logout: async (refreshToken: string) => {
    await axiosInstance.post('/auth/logout/', { refresh: refreshToken });
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get<User>('/auth/me/');
    return response.data;
  },

  changePassword: async (data: ChangePasswordData) => {
    const response = await axiosInstance.post('/auth/change-password/', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await axiosInstance.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },
};

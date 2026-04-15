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

  logout: async () => {
    await axiosInstance.post('/auth/logout/', {});
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get<User>('/auth/me/');
    return response.data;
  },

  changePassword: async (data: ChangePasswordData) => {
    const response = await axiosInstance.post('/auth/change-password/', data);
    return response.data;
  },

  refreshToken: async () => {
    const response = await axiosInstance.post('/auth/token/refresh/', {});
    return response.data;
  },

  requestPasswordReset: async (email: string) => {
    const response = await axiosInstance.post('/auth/password/reset/request/', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string, password_confirm: string) => {
    const response = await axiosInstance.post('/auth/password/reset/confirm/', {
      token,
      password,
      password_confirm,
    });
    return response.data;
  },
  
  googleLogin: async (token: string) => {
    const response = await axiosInstance.post<AuthResponse>('/auth/google/', { token });
    return response.data;
  },
};

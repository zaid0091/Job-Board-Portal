import axiosInstance from './axiosInstance';
import type { EmployerProfile, SeekerProfile } from '@/types';

export const profilesAPI = {
  getEmployerProfile: async () => {
    const response = await axiosInstance.get<EmployerProfile>('/profiles/employer/');
    return response.data;
  },

  updateEmployerProfile: async (data: FormData) => {
    const response = await axiosInstance.patch<EmployerProfile>('/profiles/employer/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getEmployerPublicProfile: async (userId: string) => {
    const response = await axiosInstance.get(`/profiles/employer/${userId}/`);
    return response.data;
  },

  getSeekerProfile: async () => {
    const response = await axiosInstance.get<SeekerProfile>('/profiles/seeker/');
    return response.data;
  },

  updateSeekerProfile: async (data: FormData) => {
    const response = await axiosInstance.patch<SeekerProfile>('/profiles/seeker/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getSkills: async () => {
    const response = await axiosInstance.get('/profiles/skills/');
    return response.data;
  },

  // Experience CRUD
  createExperience: async (data: Record<string, unknown>) => {
    const response = await axiosInstance.post('/profiles/experiences/', data);
    return response.data;
  },

  updateExperience: async (id: number, data: Record<string, unknown>) => {
    const response = await axiosInstance.patch(`/profiles/experiences/${id}/`, data);
    return response.data;
  },

  deleteExperience: async (id: number) => {
    await axiosInstance.delete(`/profiles/experiences/${id}/`);
  },

  // Education CRUD
  createEducation: async (data: Record<string, unknown>) => {
    const response = await axiosInstance.post('/profiles/educations/', data);
    return response.data;
  },

  updateEducation: async (id: number, data: Record<string, unknown>) => {
    const response = await axiosInstance.patch(`/profiles/educations/${id}/`, data);
    return response.data;
  },

  deleteEducation: async (id: number) => {
    await axiosInstance.delete(`/profiles/educations/${id}/`);
  },
};

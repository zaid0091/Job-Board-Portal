import axiosInstance from './axiosInstance';
import type {
  JobListItem,
  JobDetail,
  JobCreateData,
  JobCategory,
  JobFilters,
  PaginatedResponse,
} from '@/types';

export const jobsAPI = {
  getJobs: async (filters?: JobFilters) => {
    const response = await axiosInstance.get<PaginatedResponse<JobListItem>>('/jobs/', {
      params: filters,
    });
    return response.data;
  },

  getJob: async (slug: string) => {
    const response = await axiosInstance.get<JobDetail>(`/jobs/${slug}/`);
    return response.data;
  },

  createJob: async (data: JobCreateData) => {
    const response = await axiosInstance.post<JobDetail>('/jobs/', data);
    return response.data;
  },

  updateJob: async (slug: string, data: Partial<JobCreateData>) => {
    const response = await axiosInstance.patch<JobDetail>(`/jobs/${slug}/`, data);
    return response.data;
  },

  deleteJob: async (slug: string) => {
    await axiosInstance.delete(`/jobs/${slug}/`);
  },

  getMyJobs: async (filters?: JobFilters) => {
    const response = await axiosInstance.get<PaginatedResponse<JobListItem>>('/jobs/my-jobs/', {
      params: filters,
    });
    return response.data;
  },

  getCategories: async () => {
    const response = await axiosInstance.get<JobCategory[]>('/jobs/categories/');
    return response.data;
  },

  saveJob: async (jobId: string) => {
    const response = await axiosInstance.post('/jobs/saved/', { job_id: jobId });
    return response.data;
  },

  unsaveJob: async (savedJobId: string) => {
    await axiosInstance.delete(`/jobs/saved/${savedJobId}/`);
  },

  getSavedJobs: async (page = 1) => {
    const response = await axiosInstance.get('/jobs/saved/', { params: { page } });
    return response.data;
  },
};

import axiosInstance from './axiosInstance';
import type {
  ApplicationListItem,
  ApplicationDetail,
  ApplicationStatus,
  CoverLetterPreviewResponse,
  PaginatedResponse,
} from '@/types';

export const applicationsAPI = {
  getApplications: async (page = 1) => {
    const response = await axiosInstance.get<PaginatedResponse<ApplicationListItem>>(
      '/applications/',
      { params: { page } },
    );
    return response.data;
  },

  getApplication: async (id: string) => {
    const response = await axiosInstance.get<ApplicationDetail>(`/applications/${id}/`);
    return response.data;
  },

  createApplication: async (data: FormData) => {
    const response = await axiosInstance.post<ApplicationDetail>('/applications/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  previewCoverLetter: async (jobId: string, regenerate = false) => {
    const response = await axiosInstance.post<CoverLetterPreviewResponse>(
      '/applications/preview-cover-letter/',
      { job_id: jobId, regenerate },
    );
    return response.data;
  },

  updateStatus: async (id: string, status: ApplicationStatus, notes?: string) => {
    const response = await axiosInstance.post<ApplicationDetail>(
      `/applications/${id}/update-status/`,
      { status, notes },
    );
    return response.data;
  },

  withdrawApplication: async (id: string) => {
    const response = await axiosInstance.post<ApplicationDetail>(
      `/applications/${id}/withdraw/`,
    );
    return response.data;
  },
};

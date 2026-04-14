import axiosInstance from './axiosInstance';

export interface PlatformStats {
  active_jobs: number;
  companies: number;
  applications: number;
}

export const analyticsAPI = {
  getPlatformStats: async (): Promise<PlatformStats> => {
    const response = await axiosInstance.get('/analytics/platform/stats/');
    return response.data;
  },

  getEmployerDashboard: async () => {
    const response = await axiosInstance.get('/analytics/employer/dashboard/');
    return response.data;
  },

  getSeekerDashboard: async () => {
    const response = await axiosInstance.get('/analytics/seeker/dashboard/');
    return response.data;
  },
};

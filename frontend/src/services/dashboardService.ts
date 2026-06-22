import api from './api';
import type { DashboardData } from '@/types';

export const dashboardService = {
  getSummary: () => api.get<DashboardData>('/dashboard'),
};

import api from './api';
import type { ActivityLog } from '@/types';

export const logsService = {
  list: (params?: { modulo?: string; nivel?: string; limit?: number }) => 
    api.get<{ items: ActivityLog[] }>('/logs', { params }),
};

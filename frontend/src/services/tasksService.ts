import api from './api';
import type { Task } from '@/types';

export const tasksService = {
  list: (date?: string, status?: string) =>
    api.get<{ tasks: Task[]; date: string }>('/tasks', { params: { date, status } }),

  summary: () =>
    api.get<{ pendentes: number; concluidas: number; date: string }>('/tasks/summary'),

  pendingYesterday: () =>
    api.get<{ tasks: Task[]; date: string; count: number }>('/tasks/pending-yesterday'),

  create: (data: {
    titulo: string;
    descricao?: string;
    prioridade?: 'baixa' | 'media' | 'alta';
    data_referencia: string;
  }) => api.post<{ task: Task }>('/tasks', data),

  update: (id: number, data: Partial<Task>) =>
    api.put<{ task: Task }>(`/tasks/${id}`, data),

  toggle: (id: number) =>
    api.patch<{ task: Task }>(`/tasks/${id}/toggle`),

  importYesterday: () =>
    api.post<{ imported: number; tasks: Task[] }>('/tasks/import-yesterday'),

  delete: (id: number) =>
    api.delete(`/tasks/${id}`),

  exportTxt: (date?: string) => {
    const params = date ? `?date=${date}` : '';
    window.open(`/api/tasks/export/txt${params}`, '_blank');
  },
};

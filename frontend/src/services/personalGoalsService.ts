import api from './api';
import type { PersonalGoal } from '@/types';

export const personalGoalsService = {
  list: () => api.get<{ items: PersonalGoal[] }>('/personal-goals'),
  create: (data: Partial<PersonalGoal>) => api.post<{ item: PersonalGoal }>('/personal-goals', data),
  update: (id: number, data: Partial<PersonalGoal>) => api.put<{ item: PersonalGoal }>(`/personal-goals/${id}`, data),
  delete: (id: number) => api.delete(`/personal-goals/${id}`),
};

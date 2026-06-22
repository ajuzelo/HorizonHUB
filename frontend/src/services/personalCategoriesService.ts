import api from './api';
import type { PersonalCategory } from '@/types';

export const personalCategoriesService = {
  list: () => api.get<{ items: PersonalCategory[] }>('/personal-categories'),
  create: (data: Partial<PersonalCategory>) => api.post<{ item: PersonalCategory }>('/personal-categories', data),
  update: (id: number, data: Partial<PersonalCategory>) => api.put<{ item: PersonalCategory }>(`/personal-categories/${id}`, data),
  delete: (id: number) => api.delete(`/personal-categories/${id}`),
};

import api from './api';
import type { PersonalCard } from '@/types';

export const personalCardsService = {
  list: () => api.get<{ items: PersonalCard[] }>('/personal-cards'),
  create: (data: Partial<PersonalCard>) => api.post<{ item: PersonalCard }>('/personal-cards', data),
  update: (id: number, data: Partial<PersonalCard>) => api.put<{ item: PersonalCard }>(`/personal-cards/${id}`, data),
  delete: (id: number) => api.delete(`/personal-cards/${id}`),
};

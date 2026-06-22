import api from './api';
import type { PersonalAccount } from '@/types';

export const personalAccountsService = {
  list: (params?: { mes?: string; ano?: string; tipo?: 'receita' | 'despesa' }) =>
    api.get<{ items: PersonalAccount[] }>('/personal-accounts', { params }),

  create: (data: Partial<PersonalAccount>) =>
    api.post<{ item: PersonalAccount }>('/personal-accounts', data),

  update: (id: number, data: Partial<PersonalAccount>) =>
    api.put<{ item: PersonalAccount }>(`/personal-accounts/${id}`, data),

  delete: (id: number) =>
    api.delete(`/personal-accounts/${id}`),

  toggleStatus: (id: number) =>
    api.patch<{ item: PersonalAccount }>(`/personal-accounts/${id}/toggle`),
};

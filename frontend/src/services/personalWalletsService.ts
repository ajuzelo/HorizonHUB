import api from './api';
import type { PersonalWallet } from '@/types';

export const personalWalletsService = {
  list: () => api.get<{ items: PersonalWallet[] }>('/personal-wallets'),
  create: (data: Partial<PersonalWallet>) => api.post<{ item: PersonalWallet }>('/personal-wallets', data),
  update: (id: number, data: Partial<PersonalWallet>) => api.put<{ item: PersonalWallet }>(`/personal-wallets/${id}`, data),
  delete: (id: number) => api.delete(`/personal-wallets/${id}`),
};

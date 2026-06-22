import api from './api';
import type { NfClient } from '@/types';

export const nfClientsService = {
  list: (params?: { search?: string }) =>
    api.get<{ items: NfClient[] }>('/nf-clients', { params }),

  create: (data: Partial<NfClient>) =>
    api.post<{ item: NfClient }>('/nf-clients', data),

  update: (id: number, data: Partial<NfClient>) =>
    api.put<{ item: NfClient }>(`/nf-clients/${id}`, data),

  delete: (id: number) =>
    api.delete(`/nf-clients/${id}`),
};

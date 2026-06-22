import api from './api';
import type { AccountPayable, AccountsPayableSummary, AccountsPayableDashboardSummary } from '@/types';

export const accountsPayableService = {
  list: (params?: { competencia?: string; status?: string; loja?: string; search?: string }) =>
    api.get<{ items: AccountPayable[]; summary: AccountsPayableSummary; competencia: string; months: string[] }>('/accounts-payable', { params }),

  dashboardSummary: () =>
    api.get<AccountsPayableDashboardSummary>('/accounts-payable/dashboard'),

  getLojas: () =>
    api.get<{ lojas: string[] }>('/accounts-payable/lojas'),

  create: (data: {
    loja: string;
    competencia: string;
    descricao: string;
    valor: number;
    vencimento: string;
    observacao?: string;
  }) => api.post<{ item: AccountPayable }>('/accounts-payable', data),

  update: (id: number, data: Partial<AccountPayable>) =>
    api.put<{ item: AccountPayable }>(`/accounts-payable/${id}`, data),

  toggle: (id: number) =>
    api.patch<{ item: AccountPayable }>(`/accounts-payable/${id}/toggle`),

  delete: (id: number) =>
    api.delete(`/accounts-payable/${id}`),
};

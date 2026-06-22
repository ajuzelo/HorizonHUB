import api from './api';
import type { WhatsappHistory } from '@/types';

export const whatsappHistoryService = {
  listHistory: (params?: { search?: string }) =>
    api.get<{ items: WhatsappHistory[] }>('/whatsapp-history', { params }),

  logSend: (data: {
    telefone: string;
    cliente?: string;
    mensagem: string;
    modo: 'web' | 'api';
    status: 'aberto' | 'enviado' | 'erro';
  }) => api.post<{ message: string; history: WhatsappHistory }>('/whatsapp-history', data),

  updateStatus: (id: number, status: 'aberto' | 'enviado' | 'erro') =>
    api.put<{ history: WhatsappHistory }>(`/whatsapp-history/${id}/status`, { status }),
};

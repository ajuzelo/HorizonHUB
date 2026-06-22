import api from './api';
import type { EmailHistory } from '@/types';

export const emailService = {
  listHistory: (params?: { search?: string }) =>
    api.get<{ items: EmailHistory[] }>('/email/history', { params }),

  send: (data: {
    client_id?: number | string;
    cliente_nome: string;
    email_destino: string;
    assunto: string;
    corpo: string;
    numero_nf_produto?: string;
    numero_nf_servico?: string;
    attachments?: File[];
  }) => {
    const formData = new FormData();
    if (data.client_id) formData.append('client_id', String(data.client_id));
    formData.append('cliente_nome', data.cliente_nome);
    formData.append('email_destino', data.email_destino);
    formData.append('assunto', data.assunto);
    formData.append('corpo', data.corpo);
    if (data.numero_nf_produto) formData.append('numero_nf_produto', data.numero_nf_produto);
    if (data.numero_nf_servico) formData.append('numero_nf_servico', data.numero_nf_servico);

    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    return api.post<{ message: string; history: EmailHistory }>('/email/send', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

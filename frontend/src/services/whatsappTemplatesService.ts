import api from './api';
import type { WhatsappTemplate } from '@/types';

export const whatsappTemplatesService = {
  list: () =>
    api.get<{ items: WhatsappTemplate[] }>('/whatsapp-templates'),

  create: (data: Partial<WhatsappTemplate>) =>
    api.post<{ item: WhatsappTemplate }>('/whatsapp-templates', data),

  update: (id: number, data: Partial<WhatsappTemplate>) =>
    api.put<{ item: WhatsappTemplate }>(`/whatsapp-templates/${id}`, data),

  delete: (id: number) =>
    api.delete(`/whatsapp-templates/${id}`),
};

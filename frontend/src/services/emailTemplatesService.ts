import api from './api';
import type { EmailTemplate } from '@/types';

export const emailTemplatesService = {
  list: () =>
    api.get<{ items: EmailTemplate[] }>('/email-templates'),

  create: (data: Partial<EmailTemplate>) =>
    api.post<{ item: EmailTemplate }>('/email-templates', data),

  update: (id: number, data: Partial<EmailTemplate>) =>
    api.put<{ item: EmailTemplate }>(`/email-templates/${id}`, data),

  delete: (id: number) =>
    api.delete(`/email-templates/${id}`),
};

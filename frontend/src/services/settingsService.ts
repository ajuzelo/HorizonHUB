import api from './api';
import type { Settings } from '@/types';

export const settingsService = {
  getSettings: () =>
    api.get<Settings>('/settings'),

  updateSmtp: (data: {
    smtp_host: string;
    smtp_port: number;
    smtp_email: string;
    smtp_senha?: string;
    smtp_nome_remetente: string;
    smtp_ssl: boolean;
  }) => api.put<{ message: string; settings: Settings }>('/settings/smtp', data),

  updateWhatsapp: (data: {
    whatsapp_modo: 'web' | 'api';
    whatsapp_api_token?: string;
  }) => api.put<{ message: string; settings: Settings }>('/settings/whatsapp', data),
};

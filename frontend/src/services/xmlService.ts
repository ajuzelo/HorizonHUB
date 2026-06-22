import api from './api';
import type { XmlFile, XmlItem } from '@/types';

export const xmlService = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('xml', file);
    return api.post<{ message: string; xml: XmlFile }>('/xml/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  list: (params?: { search?: string; fornecedor?: string; date_from?: string; date_to?: string; page?: number; limit?: number }) =>
    api.get<{ items: XmlFile[]; total: number; page: number; limit: number }>('/xml', { params }),

  getById: (id: number) =>
    api.get<{ xml: XmlFile; items: XmlItem[] }>(`/xml/${id}`),

  delete: (id: number) =>
    api.delete(`/xml/${id}`),

  summary: () =>
    api.get<{ total: number; hoje: number }>('/xml/summary'),
};

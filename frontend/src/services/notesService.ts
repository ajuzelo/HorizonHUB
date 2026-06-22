import api from './api';
import type { Note, NoteCategory } from '@/types';

export const notesService = {
  list: (categoria?: NoteCategory, search?: string) =>
    api.get<{ notes: Note[] }>('/notes', { params: { categoria, search } }),

  summary: () =>
    api.get<{ notes: Note[]; total: number }>('/notes/summary'),

  create: (data: {
    conteudo: string;
    titulo?: string;
    categoria?: NoteCategory;
    cor_index?: number;
  }) => api.post<{ note: Note }>('/notes', data),

  update: (id: number, data: Partial<Note>) =>
    api.put<{ note: Note }>(`/notes/${id}`, data),

  togglePin: (id: number) =>
    api.patch<{ note: Note }>(`/notes/${id}/pin`),

  delete: (id: number) =>
    api.delete(`/notes/${id}`),
};

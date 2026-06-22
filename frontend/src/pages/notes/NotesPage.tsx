import { useState, useEffect, useRef } from 'react';
import {
  StickyNote, Plus, Pin, Trash2, Search, Loader2, X, Check, Edit3
} from 'lucide-react';
import { notesService } from '@/services/notesService';
import type { Note, NoteCategory } from '@/types';
import { cn } from '@/lib/utils';

const CATEGORIES: { value: NoteCategory | 'todas'; label: string }[] = [
  { value: 'todas',     label: 'Todas'        },
  { value: 'empresa',   label: 'Empresa'      },
  { value: 'pessoal',   label: 'Pessoal'      },
  { value: 'financeiro',label: 'Financeiro'   },
  { value: 'senhas',    label: 'Senhas'       },
  { value: 'textos',    label: 'Textos Prontos'},
  { value: 'outros',    label: 'Outros'       },
];

const CATEGORY_COLORS: Record<NoteCategory, string> = {
  empresa:    'text-blue-400 bg-blue-400/10 border-blue-400/20',
  pessoal:    'text-purple-400 bg-purple-400/10 border-purple-400/20',
  financeiro: 'text-success bg-success/10 border-success/20',
  senhas:     'text-danger bg-danger/10 border-danger/20',
  textos:     'text-warning bg-warning/10 border-warning/20',
  outros:     'text-text-secondary bg-white/5 border-white/[0.07]',
};

const NOTE_COLORS = [
  '#1C2333', '#1E2A1E', '#2A1E1E', '#1E1E2A', '#2A2A1E',
  '#1E262A', '#2A1E26', '#201E2A',
];

interface NoteCardProps {
  note: Note;
  onDelete: (id: number) => void;
  onTogglePin: (id: number) => void;
  onEdit: (note: Note) => void;
}

function NoteCard({ note, onDelete, onTogglePin, onEdit }: NoteCardProps) {
  const catColor = CATEGORY_COLORS[note.categoria];
  const catLabel = CATEGORIES.find((c) => c.value === note.categoria)?.label ?? note.categoria;
  const bgColor = NOTE_COLORS[note.cor_index % NOTE_COLORS.length];

  return (
    <div
      className="group relative rounded-xl border border-white/[0.07] p-4 flex flex-col gap-2
                 hover:border-white/[0.14] transition-all duration-200 cursor-pointer"
      style={{ backgroundColor: bgColor }}
      onClick={() => onEdit(note)}
    >
      {/* Pin icon */}
      {note.fixado && (
        <Pin size={12} className="absolute top-3 right-10 text-gold fill-gold" />
      )}

      {/* Actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePin(note.id); }}
          className={cn(
            'w-6 h-6 rounded-md flex items-center justify-center transition-colors',
            note.fixado ? 'text-gold bg-gold/10' : 'text-text-muted bg-white/5 hover:text-gold'
          )}
          title={note.fixado ? 'Desafixar' : 'Fixar'}
        >
          <Pin size={11} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
          className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted bg-white/5 hover:text-danger transition-colors"
          title="Excluir"
        >
          <Trash2 size={11} />
        </button>
      </div>

      {/* Title */}
      {note.titulo && (
        <p className="text-sm font-semibold text-text-primary pr-12 line-clamp-1">{note.titulo}</p>
      )}

      {/* Content */}
      <p className={cn(
        'text-xs text-text-secondary leading-relaxed whitespace-pre-wrap',
        note.titulo ? 'line-clamp-4' : 'line-clamp-6'
      )}>
        {note.conteudo}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className={cn('badge text-[10px]', catColor)}>{catLabel}</span>
        <span className="text-[10px] text-text-muted">
          {new Date(note.atualizado_em).toLocaleDateString('pt-BR')}
        </span>
      </div>
    </div>
  );
}

interface NoteEditorProps {
  note?: Note | null;
  onSave: (data: { conteudo: string; titulo?: string; categoria: NoteCategory; cor_index: number }) => void;
  onClose: () => void;
}

function NoteEditor({ note, onSave, onClose }: NoteEditorProps) {
  const [titulo, setTitulo] = useState(note?.titulo ?? '');
  const [conteudo, setConteudo] = useState(note?.conteudo ?? '');
  const [categoria, setCategoria] = useState<NoteCategory>(note?.categoria ?? 'outros');
  const [corIndex, setCorIndex] = useState(note?.cor_index ?? 0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const handleSave = () => {
    if (!conteudo.trim()) return;
    onSave({ conteudo: conteudo.trim(), titulo: titulo.trim() || undefined, categoria, cor_index: corIndex });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg animate-scale-in"
        style={{ background: NOTE_COLORS[corIndex % NOTE_COLORS.length] }}>
        <div className="rounded-2xl border border-white/[0.1] p-5 shadow-panel">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-text-primary">
              {note ? 'Editar nota' : 'Nova nota'}
            </p>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Título */}
          <input
            type="text"
            placeholder="Título (opcional)"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="input mb-3 text-sm font-medium"
          />

          {/* Conteúdo */}
          <textarea
            ref={textareaRef}
            placeholder="Escreva sua nota aqui..."
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            rows={6}
            className="input resize-none text-sm mb-3 font-mono leading-relaxed"
          />

          {/* Categoria */}
          <div className="mb-3">
            <p className="input-label">Categoria</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.filter((c) => c.value !== 'todas').map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategoria(c.value as NoteCategory)}
                  className={cn(
                    'badge cursor-pointer text-[11px] transition-all',
                    categoria === c.value
                      ? CATEGORY_COLORS[c.value as NoteCategory]
                      : 'bg-white/5 text-text-muted border-white/[0.06] hover:border-white/10'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cor */}
          <div className="mb-4">
            <p className="input-label">Cor</p>
            <div className="flex gap-1.5">
              {NOTE_COLORS.map((color, i) => (
                <button
                  key={i}
                  onClick={() => setCorIndex(i)}
                  className={cn(
                    'w-6 h-6 rounded-md border-2 transition-all',
                    corIndex === i ? 'border-gold scale-110' : 'border-white/10 hover:border-white/25'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button
              onClick={handleSave}
              disabled={!conteudo.trim()}
              className="btn-primary flex-1"
            >
              <Check size={14} />
              {note ? 'Salvar' : 'Criar nota'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<NoteCategory | 'todas'>('todas');
  const [editing, setEditing] = useState<Note | null | undefined>(undefined);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const cat = activeCategory !== 'todas' ? activeCategory : undefined;
      const res = await notesService.list(cat, search || undefined);
      setNotes(res.data.notes);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { loadNotes(); }, [activeCategory, search]);

  const handleSave = async (data: Parameters<NoteEditorProps['onSave']>[0]) => {
    try {
      if (editing && editing.id) {
        const res = await notesService.update(editing.id, data);
        setNotes((prev) => prev.map((n) => (n.id === editing.id ? res.data.note : n)));
      } else {
        const res = await notesService.create(data);
        setNotes((prev) => [res.data.note, ...prev]);
      }
      setEditing(undefined);
    } catch {}
  };

  const handleDelete = async (id: number) => {
    try {
      await notesService.delete(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {}
  };

  const handleTogglePin = async (id: number) => {
    try {
      const res = await notesService.togglePin(id);
      setNotes((prev) => prev.map((n) => (n.id === id ? res.data.note : n)));
    } catch {}
  };

  const pinned = notes.filter((n) => n.fixado);
  const unpinned = notes.filter((n) => !n.fixado);

  return (
    <div className="animate-fade-in">
      {editing !== undefined && (
        <NoteEditor
          note={editing}
          onSave={handleSave}
          onClose={() => setEditing(undefined)}
        />
      )}

      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <StickyNote size={20} className="text-gold" /> Notas Rápidas
          </h1>
          <p className="page-subtitle">{notes.length} nota{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setEditing(null)} className="btn-primary">
          <Plus size={14} /> Nova nota
        </button>
      </div>

      {/* Search + Category filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Pesquisar notas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setActiveCategory(c.value as any)}
              className={cn(
                'badge text-[11px] cursor-pointer transition-all',
                activeCategory === c.value
                  ? c.value !== 'todas'
                    ? CATEGORY_COLORS[c.value as NoteCategory]
                    : 'badge-gold'
                  : 'bg-white/5 text-text-muted border-white/[0.06] hover:border-white/10 hover:text-text-primary'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin text-gold" />
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-bg-elevated border border-white/[0.07] flex items-center justify-center mb-3">
            <StickyNote size={20} className="text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text-secondary">Nenhuma nota encontrada</p>
          <p className="text-xs text-text-muted mt-1">Clique em "Nova nota" para criar a primeira</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Fixadas */}
          {pinned.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Pin size={11} className="text-gold fill-gold" /> Fixadas ({pinned.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pinned.map((n) => (
                  <NoteCard key={n.id} note={n} onDelete={handleDelete} onTogglePin={handleTogglePin} onEdit={setEditing} />
                ))}
              </div>
            </div>
          )}

          {/* Outras */}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                  Outras ({unpinned.length})
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {unpinned.map((n) => (
                  <NoteCard key={n.id} note={n} onDelete={handleDelete} onTogglePin={handleTogglePin} onEdit={setEditing} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

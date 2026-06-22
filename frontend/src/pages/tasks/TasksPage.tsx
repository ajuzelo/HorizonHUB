import { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare, Plus, ChevronLeft, ChevronRight, Download,
  Loader2, ArrowDownToLine, Trash2, AlertCircle, Flag, Search
} from 'lucide-react';
import { tasksService } from '@/services/tasksService';
import type { Task } from '@/types';
import { cn, formatDate } from '@/lib/utils';

const PRIORITY_CONFIG = {
  alta:  { label: 'Alta',  color: 'text-danger',  bg: 'bg-danger/10',  border: 'border-danger/20'  },
  media: { label: 'Média', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
  baixa: { label: 'Baixa', color: 'text-info',    bg: 'bg-info/10',    border: 'border-info/20'    },
};

function dateToLocal(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

interface ImportModalProps {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function ImportModal({ count, onConfirm, onCancel }: ImportModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative glass-card p-6 w-full max-w-sm animate-scale-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
            <ArrowDownToLine size={18} className="text-gold" />
          </div>
          <div>
            <p className="font-semibold text-text-primary text-sm">Importar tarefas pendentes</p>
            <p className="text-xs text-text-secondary mt-0.5">{count} tarefa{count !== 1 ? 's' : ''} pendente{count !== 1 ? 's' : ''} do dia anterior</p>
          </div>
        </div>
        <p className="text-sm text-text-secondary mb-5">
          Deseja importar as tarefas pendentes de ontem para hoje?
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-secondary flex-1">Não, obrigado</button>
          <button onClick={onConfirm} className="btn-primary flex-1">Importar tarefas</button>
        </div>
      </div>
    </div>
  );
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  loading: boolean;
}

function TaskItem({ task, onToggle, onDelete, loading }: TaskItemProps) {
  const prio = PRIORITY_CONFIG[task.prioridade];
  const done = task.status === 'concluido';

  return (
    <div className={cn(
      'group flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200',
      done
        ? 'bg-white/[0.02] border-white/[0.04] opacity-60'
        : 'bg-bg-elevated border-white/[0.07] hover:border-white/[0.12] hover:bg-bg-overlay'
    )}>
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        disabled={loading}
        className={cn(
          'mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150',
          done
            ? 'bg-gold/80 border-gold/80'
            : 'border-white/20 hover:border-gold/50 hover:bg-gold/5'
        )}
      >
        {done && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#0F1117" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium leading-snug',
          done ? 'line-through text-text-muted' : 'text-text-primary'
        )}>
          {task.titulo}
          {task.importado_dia_anterior && (
            <span className="ml-2 text-[10px] text-text-muted">(importado)</span>
          )}
        </p>
        {task.descricao && !done && (
          <p className="text-xs text-text-muted mt-1 line-clamp-2">{task.descricao}</p>
        )}
      </div>

      {/* Priority badge */}
      <span className={cn('badge text-[10px] flex-shrink-0 mt-0.5', prio.bg, prio.color, prio.border)}>
        <Flag size={9} />
        {prio.label}
      </span>

      {/* Delete button */}
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all p-0.5"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

export default function TasksPage() {
  const today = new Date().toISOString().split('T')[0];
  const [currentDate, setCurrentDate] = useState(today);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<'baixa' | 'media' | 'alta'>('media');
  const [search, setSearch] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [pendingYesterday, setPendingYesterday] = useState(0);
  const [checkedImport, setCheckedImport] = useState(false);

  const loadTasks = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const res = await tasksService.list(date);
      setTasks(res.data.tasks);
    } catch {}
    finally { setLoading(false); }
  }, []);

  // On mount: check pending tasks from yesterday
  useEffect(() => {
    if (!checkedImport && currentDate === today) {
      tasksService.pendingYesterday()
        .then(({ data }) => {
          if (data.count > 0) {
            setPendingYesterday(data.count);
            setShowImportModal(true);
          }
        })
        .catch(() => {})
        .finally(() => setCheckedImport(true));
    }
  }, [checkedImport, currentDate, today]);

  useEffect(() => { loadTasks(currentDate); }, [currentDate, loadTasks]);

  const handleImport = async () => {
    setShowImportModal(false);
    try {
      await tasksService.importYesterday();
      loadTasks(currentDate);
    } catch {}
  };

  const handleAdd = async () => {
    if (!newTask.trim()) return;
    setActionLoading(true);
    try {
      const res = await tasksService.create({
        titulo: newTask.trim(),
        prioridade: priority,
        data_referencia: currentDate,
      });
      setTasks((prev) => [...prev, res.data.task]);
      setNewTask('');
    } catch {}
    finally { setActionLoading(false); }
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await tasksService.toggle(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? res.data.task : t)));
    } catch {}
  };

  const handleDelete = async (id: number) => {
    try {
      await tasksService.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {}
  };

  const filtered = tasks.filter((t) =>
    !search || t.titulo.toLowerCase().includes(search.toLowerCase())
  );

  const pendentes = filtered.filter((t) => t.status === 'pendente');
  const concluidas = filtered.filter((t) => t.status === 'concluido');

  const isToday = currentDate === today;

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {showImportModal && (
        <ImportModal
          count={pendingYesterday}
          onConfirm={handleImport}
          onCancel={() => setShowImportModal(false)}
        />
      )}

      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <CheckSquare size={20} className="text-gold" /> Tarefas
          </h1>
          <p className="page-subtitle capitalize">{dateToLocal(currentDate)}</p>
        </div>
        <button
          onClick={() => tasksService.exportTxt(currentDate)}
          className="btn-secondary text-xs"
        >
          <Download size={13} /> Exportar TXT
        </button>
      </div>

      {/* Date navigator */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setCurrentDate(addDays(currentDate, -1))}
          className="btn-ghost p-1.5 rounded-lg"
        >
          <ChevronLeft size={16} />
        </button>

        <input
          type="date"
          value={currentDate}
          onChange={(e) => setCurrentDate(e.target.value)}
          className="input text-center text-sm max-w-[160px]"
        />

        <button
          onClick={() => setCurrentDate(addDays(currentDate, 1))}
          className="btn-ghost p-1.5 rounded-lg"
          disabled={currentDate >= today}
        >
          <ChevronRight size={16} />
        </button>

        {!isToday && (
          <button
            onClick={() => setCurrentDate(today)}
            className="btn-ghost text-xs text-gold"
          >
            Hoje
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-text-muted">{tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}</span>
          {pendentes.length > 0 && (
            <span className="badge-warning text-[10px]">{pendentes.length} pendente{pendentes.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Pesquisar tarefas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9 text-sm"
        />
      </div>

      {/* Add task */}
      <div className="card p-4 mb-4">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Nova tarefa..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="input flex-1 text-sm"
          />
          <button
            onClick={handleAdd}
            disabled={!newTask.trim() || actionLoading}
            className="btn-primary px-3"
          >
            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          </button>
        </div>
        {/* Priority selector */}
        <div className="flex gap-1.5">
          <span className="text-xs text-text-muted self-center mr-1">Prioridade:</span>
          {(['baixa', 'media', 'alta'] as const).map((p) => {
            const c = PRIORITY_CONFIG[p];
            return (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={cn(
                  'badge cursor-pointer transition-all',
                  priority === p
                    ? cn(c.bg, c.color, c.border)
                    : 'bg-white/5 text-text-muted border-white/[0.06] hover:border-white/10'
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasks list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin text-gold" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-bg-elevated border border-white/[0.07] flex items-center justify-center mb-3">
            <CheckSquare size={20} className="text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text-secondary">
            {search ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa para este dia'}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {search ? 'Tente outro termo de busca' : 'Adicione sua primeira tarefa acima'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pendentes */}
          {pendentes.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 px-1">
                Pendentes ({pendentes.length})
              </p>
              <div className="space-y-1.5">
                {pendentes.map((t) => (
                  <TaskItem key={t.id} task={t} onToggle={handleToggle} onDelete={handleDelete} loading={actionLoading} />
                ))}
              </div>
            </div>
          )}

          {/* Concluídas */}
          {concluidas.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 px-1">
                Concluídas ({concluidas.length})
              </p>
              <div className="space-y-1.5">
                {concluidas.map((t) => (
                  <TaskItem key={t.id} task={t} onToggle={handleToggle} onDelete={handleDelete} loading={actionLoading} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

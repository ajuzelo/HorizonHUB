import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare, StickyNote, TrendingUp, TrendingDown, Wallet,
  ArrowRight, Loader2, RefreshCw, Plus
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { dashboardService } from '@/services/dashboardService';
import type { DashboardData, Note } from '@/types';
import { cn, formatCurrency } from '@/lib/utils';

function WelcomeBanner({ name, profileName }: { name: string; profileName?: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const dateStr = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div
      className="relative rounded-2xl border border-gold/[0.15] overflow-hidden p-5 mb-6"
      style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(22,27,39,0.8) 60%)' }}
    >
      <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.04] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)' }} />
      <div className="relative">
        {profileName && (
          <p className="text-[10px] font-medium text-gold/70 uppercase tracking-wider mb-1">
            Perfil {profileName}
          </p>
        )}
        <h1 className="text-xl font-bold text-text-primary">
          {greeting}, <span className="text-gradient-gold">{name.split(' ')[0]}</span>! 👋
        </h1>
        <p className="text-sm text-text-secondary mt-1 capitalize">{dateStr}</p>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bg: string;
  border: string;
  onClick?: () => void;
  loading?: boolean;
  sub?: string;
}

function StatCard({ label, value, icon: Icon, color, bg, border, onClick, loading, sub }: StatCardProps) {
  return (
    <div
      className={cn(
        'stat-card border cursor-pointer hover:translate-y-[-2px] transition-all duration-200',
        border, bg
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="stat-label">{label}</p>
          {loading ? (
            <div className="skeleton h-8 w-16 rounded-lg mt-2" />
          ) : (
            <p className="stat-value mt-1.5">{value}</p>
          )}
          {sub && !loading && <p className="text-xs text-text-muted mt-1">{sub}</p>}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
          <Icon size={18} className={color} />
        </div>
      </div>
    </div>
  );
}

const NOTE_COLORS = [
  '#1C2333', '#1E2A1E', '#2A1E1E', '#1E1E2A', '#2A2A1E',
  '#1E262A', '#2A1E26', '#201E2A',
];

function RecentNoteCard({ note, onClick }: { note: Note; onClick: () => void }) {
  const bg = NOTE_COLORS[note.cor_index % NOTE_COLORS.length];
  return (
    <div
      className="rounded-xl border border-white/[0.07] p-3 cursor-pointer hover:border-white/[0.14] transition-all"
      style={{ backgroundColor: bg }}
      onClick={onClick}
    >
      {note.titulo && <p className="text-xs font-semibold text-text-primary mb-1 truncate">{note.titulo}</p>}
      <p className="text-xs text-text-secondary line-clamp-3 whitespace-pre-wrap leading-relaxed">{note.conteudo}</p>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, activeProfileId, profiles } = useAuthStore();
  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const isProfessional = activeProfile?.nome === 'Profissional';

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await dashboardService.getSummary();
      setData(res.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadDashboard(); }, []);

  const tasksDone = data?.tasks.concluidas ?? 0;
  const tasksPending = data?.tasks.pendentes ?? 0;
  const tasksTotal = tasksDone + tasksPending;
  const progress = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

  return (
    <div className="animate-fade-in">
      <WelcomeBanner name={user?.nome ?? 'Usuário'} profileName={activeProfile?.nome} />

      {/* Refresh button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
          className="btn-ghost text-xs"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Tarefas hoje"
          value={`${tasksDone}/${tasksTotal}`}
          sub={`${tasksPending} pendente${tasksPending !== 1 ? 's' : ''}`}
          icon={CheckSquare}
          color="text-gold"
          bg="bg-gold/5"
          border="border-gold/10"
          loading={loading}
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          label="Notas Rápidas"
          value={loading ? '—' : data?.notes.total ?? 0}
          icon={StickyNote}
          color="text-info"
          bg="bg-info/5"
          border="border-info/10"
          loading={loading}
          onClick={() => navigate('/notes')}
        />
        {isProfessional ? (
          <>
            <StatCard
              label="Receitas do mês"
              value={loading ? '—' : formatCurrency(data?.finance.receitas_mes ?? 0)}
              icon={TrendingUp}
              color="text-success"
              bg="bg-success/5"
              border="border-success/10"
              loading={loading}
              onClick={() => navigate('/personal-finance')}
            />
            <StatCard
              label="Despesas do mês"
              value={loading ? '—' : formatCurrency(data?.finance.despesas_mes ?? 0)}
              icon={TrendingDown}
              color="text-danger"
              bg="bg-danger/5"
              border="border-danger/10"
              loading={loading}
              onClick={() => navigate('/personal-finance')}
            />
          </>
        ) : (
          <>
            <StatCard
              label="Saldo do mês"
              value={loading ? '—' : formatCurrency(data?.finance.saldo_mes ?? 0)}
              icon={Wallet}
              color={data?.finance.saldo_mes && data.finance.saldo_mes >= 0 ? 'text-success' : 'text-danger'}
              bg={data?.finance.saldo_mes && data.finance.saldo_mes >= 0 ? 'bg-success/5' : 'bg-danger/5'}
              border={data?.finance.saldo_mes && data.finance.saldo_mes >= 0 ? 'border-success/10' : 'border-danger/10'}
              loading={loading}
              onClick={() => navigate('/personal-finance')}
            />
            <StatCard
              label="Despesas do mês"
              value={loading ? '—' : formatCurrency(data?.finance.despesas_mes ?? 0)}
              icon={TrendingDown}
              color="text-danger"
              bg="bg-danger/5"
              border="border-danger/10"
              loading={loading}
              onClick={() => navigate('/personal-finance')}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Progress das tarefas */}
        <div className="card p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-text-primary">Tarefas de hoje</p>
            <button onClick={() => navigate('/tasks')} className="btn-ghost text-xs">
              <ArrowRight size={12} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              <div className="skeleton h-4 rounded-full" />
              <div className="skeleton h-3 rounded-full w-3/4" />
            </div>
          ) : tasksTotal === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-text-muted mb-3">Nenhuma tarefa criada hoje</p>
              <button onClick={() => navigate('/tasks')} className="btn-primary text-xs">
                <Plus size={12} /> Criar tarefas
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-text-secondary">{tasksDone} concluídas</span>
                <span className="text-gold font-semibold">{progress}%</span>
              </div>
              <div className="h-2 bg-bg-base rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-gold to-gold/70 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1 text-center bg-bg-elevated rounded-xl py-2.5 border border-white/[0.06]">
                  <p className="text-xl font-bold text-text-primary">{tasksPending}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">pendentes</p>
                </div>
                <div className="flex-1 text-center bg-bg-elevated rounded-xl py-2.5 border border-white/[0.06]">
                  <p className="text-xl font-bold text-gold">{tasksDone}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">concluídas</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notas recentes */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-text-primary">Notas recentes</p>
            <button onClick={() => navigate('/notes')} className="btn-ghost text-xs">
              <ArrowRight size={12} />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
            </div>
          ) : !data?.notes.recentes.length ? (
            <div className="text-center py-6">
              <p className="text-xs text-text-muted mb-3">Nenhuma nota criada ainda</p>
              <button onClick={() => navigate('/notes')} className="btn-primary text-xs">
                <Plus size={12} /> Criar nota
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.notes.recentes.map((note) => (
                <RecentNoteCard
                  key={note.id}
                  note={note}
                  onClick={() => navigate('/notes')}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

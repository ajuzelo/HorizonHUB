import { useState, useEffect, useCallback } from 'react';
import {
  Wallet, Plus, Search, ChevronLeft, ChevronRight,
  CheckCircle2, Circle, Trash2, Loader2, Filter, FileText
} from 'lucide-react';
import { accountsPayableService } from '@/services/accountsPayableService';
import type { AccountPayable, AccountsPayableSummary } from '@/types';
import { cn, formatCurrency } from '@/lib/utils';

interface AccountsPayableEditorProps {
  item?: AccountPayable | null;
  onSave: () => void;
  onClose: () => void;
}

function AccountsPayableEditor({ item, onSave, onClose }: AccountsPayableEditorProps) {
  const today = new Date().toISOString().split('T')[0];
  const [loja, setLoja] = useState(item?.loja ?? '');
  const [descricao, setDescricao] = useState(item?.descricao ?? '');
  const [valor, setValor] = useState(item?.valor ? String(item.valor) : '');
  const [vencimento, setVencimento] = useState(item?.vencimento ?? today);
  const [competencia, setCompetencia] = useState(item?.competencia ?? today.substring(0, 7));
  const [observacao, setObservacao] = useState(item?.observacao ?? '');
  const [loading, setLoading] = useState(false);

  // Lojas autocomplete
  const [lojas, setLojas] = useState<string[]>([]);
  const [showLojas, setShowLojas] = useState(false);

  useEffect(() => {
    accountsPayableService.getLojas().then((res) => setLojas(res.data.lojas)).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!loja || !descricao || !valor || !vencimento || !competencia) return;
    setLoading(true);
    try {
      const data = {
        loja,
        descricao,
        valor: parseFloat(valor.replace(',', '.')),
        vencimento,
        competencia,
        observacao,
      };

      if (item) {
        await accountsPayableService.update(item.id, data);
      } else {
        await accountsPayableService.create(data);
      }
      onSave();
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative glass-card p-6 w-full max-w-md animate-scale-in">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          {item ? 'Editar Conta' : 'Nova Conta a Pagar'}
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Competência</label>
              <input type="month" value={competencia} onChange={(e) => setCompetencia(e.target.value)} className="input" />
            </div>
            <div>
              <label className="input-label">Vencimento</label>
              <input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} className="input" />
            </div>
          </div>

          <div className="relative">
            <label className="input-label">Loja / Fornecedor</label>
            <input
              type="text"
              value={loja}
              onChange={(e) => { setLoja(e.target.value); setShowLojas(true); }}
              onFocus={() => setShowLojas(true)}
              onBlur={() => setTimeout(() => setShowLojas(false), 200)}
              className="input"
              placeholder="Ex: Enel, Vivo, Fornecedor X"
            />
            {showLojas && lojas.filter(l => l.toLowerCase().includes(loja.toLowerCase()) && l !== loja).length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-bg-elevated border border-white/[0.07] rounded-xl shadow-panel max-h-40 overflow-y-auto">
                {lojas.filter(l => l.toLowerCase().includes(loja.toLowerCase()) && l !== loja).map(l => (
                  <button
                    key={l}
                    onClick={() => { setLoja(l); setShowLojas(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-bg-overlay hover:text-text-primary"
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="input-label">Descrição</label>
            <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="input" placeholder="Ex: Conta de Luz" />
          </div>

          <div>
            <label className="input-label">Valor (R$)</label>
            <input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} className="input font-mono" placeholder="0.00" />
          </div>

          <div>
            <label className="input-label">Observação (Opcional)</label>
            <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} className="input resize-none" rows={2} />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={handleSave} disabled={loading || !loja || !descricao || !valor || !vencimento || !competencia} className="btn-primary flex-1">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountsPayablePage() {
  const [items, setItems] = useState<AccountPayable[]>([]);
  const [summary, setSummary] = useState<AccountsPayableSummary | null>(null);
  const [months, setMonths] = useState<string[]>([]);
  const [competencia, setCompetencia] = useState(new Date().toISOString().substring(0, 7));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendente' | 'lancado'>('todos');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AccountPayable | null | undefined>(undefined);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await accountsPayableService.list({
        competencia,
        search: search || undefined,
        status: statusFilter !== 'todos' ? statusFilter : undefined,
      });
      setItems(res.data.items);
      setSummary(res.data.summary);
      setMonths(res.data.months);
    } catch {}
    finally { setLoading(false); }
  }, [competencia, search, statusFilter]);

  useEffect(() => {
    const delay = setTimeout(loadData, 300);
    return () => clearTimeout(delay);
  }, [loadData]);

  const handleToggle = async (id: number) => {
    try {
      const res = await accountsPayableService.toggle(id);
      setItems(prev => prev.map(item => item.id === id ? res.data.item : item));
      loadData(); // Reload to update summary
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir esta conta?')) return;
    try {
      await accountsPayableService.delete(id);
      loadData();
    } catch {}
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="animate-fade-in">
      {editing !== undefined && (
        <AccountsPayableEditor
          item={editing}
          onSave={() => { setEditing(undefined); loadData(); }}
          onClose={() => setEditing(undefined)}
        />
      )}

      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Wallet size={20} className="text-gold" /> Contas a Pagar
          </h1>
          <p className="page-subtitle">Controle financeiro do perfil profissional</p>
        </div>
        <button onClick={() => setEditing(null)} className="btn-primary">
          <Plus size={14} /> Nova Conta
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-text-muted mb-1">Total do Mês</p>
          <p className="text-lg font-semibold text-text-primary">{formatCurrency(summary?.total_geral ?? 0)}</p>
        </div>
        <div className="card p-4 border-warning/20 bg-warning/5">
          <p className="text-xs text-text-muted mb-1">Pendentes</p>
          <p className="text-lg font-semibold text-warning">{formatCurrency(summary?.total_pendente ?? 0)}</p>
        </div>
        <div className="card p-4 border-success/20 bg-success/5">
          <p className="text-xs text-text-muted mb-1">Lançados (Pagos)</p>
          <p className="text-lg font-semibold text-success">{formatCurrency(summary?.total_lancado ?? 0)}</p>
        </div>
        <div className="card p-4 border-danger/20 bg-danger/5">
          <p className="text-xs text-text-muted mb-1">Vencidos</p>
          <p className="text-lg font-semibold text-danger">{summary?.vencidos ?? 0} contas</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 bg-bg-surface border border-white/[0.06] rounded-xl p-1">
          <input
            type="month"
            value={competencia}
            onChange={(e) => setCompetencia(e.target.value)}
            className="bg-transparent border-none text-sm text-text-primary px-2 focus:outline-none"
          />
        </div>

        <div className="flex gap-1 bg-bg-surface border border-white/[0.06] rounded-xl p-1">
          {(['todos', 'pendente', 'lancado'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                statusFilter === s ? 'bg-gold/10 text-gold' : 'text-text-muted hover:text-text-primary'
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Pesquisar loja ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.02] border-b border-white/[0.06]">
              <tr>
                <th className="p-4 font-medium text-text-muted w-12">Status</th>
                <th className="p-4 font-medium text-text-muted">Vencimento</th>
                <th className="p-4 font-medium text-text-muted">Loja / Descrição</th>
                <th className="p-4 font-medium text-text-muted text-right">Valor</th>
                <th className="p-4 font-medium text-text-muted w-16"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 size={24} className="animate-spin text-gold mx-auto" />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="flex flex-col items-center">
                      <FileText size={32} className="text-text-muted mb-2" />
                      <p className="text-text-secondary">Nenhuma conta encontrada</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isOverdue = item.status === 'pendente' && item.vencimento < today;
                  const isDone = item.status === 'lancado';
                  return (
                    <tr key={item.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors group">
                      <td className="p-4">
                        <button onClick={() => handleToggle(item.id)} className="focus:outline-none">
                          {isDone ? (
                            <CheckCircle2 size={20} className="text-success" />
                          ) : (
                            <Circle size={20} className={isOverdue ? 'text-danger' : 'text-text-muted hover:text-gold'} />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <span className={cn('text-xs font-medium px-2 py-1 rounded-md', 
                          isDone ? 'bg-success/10 text-success' : 
                          isOverdue ? 'bg-danger/10 text-danger' : 'bg-white/5 text-text-primary'
                        )}>
                          {new Date(item.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className={cn('font-semibold', isDone ? 'text-text-secondary line-through' : 'text-text-primary')}>
                          {item.loja}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">{item.descricao}</p>
                      </td>
                      <td className="p-4 text-right">
                        <span className={cn('font-mono font-medium', isDone ? 'text-text-muted' : 'text-text-primary')}>
                          {formatCurrency(Number(item.valor))}
                        </span>
                      </td>
                      <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditing(item)} className="text-text-muted hover:text-gold transition-colors">
                            <span className="text-xs">Editar</span>
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="text-text-muted hover:text-danger transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

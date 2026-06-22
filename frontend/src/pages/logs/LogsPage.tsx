import { useState, useEffect } from 'react';
import { Activity, Search, Filter, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logsService } from '@/services/logsService';
import type { ActivityLog } from '@/types';

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModulo, setFilterModulo] = useState('');
  const [filterNivel, setFilterNivel] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await logsService.list({ 
        modulo: filterModulo || undefined, 
        nivel: filterNivel || undefined,
        limit: 200
      });
      setLogs(res.data.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterModulo, filterNivel]);

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto">
      <div className="page-header mb-8">
        <h1 className="page-title flex items-center gap-2">
          <Activity size={24} className="text-gold" /> Logs do Sistema
        </h1>
        <p className="page-subtitle">Trilha de auditoria e registro de atividades</p>
      </div>

      <div className="card p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 focus-within:border-gold/30 transition-colors">
          <Search size={16} className="text-text-muted" />
          <input 
            type="text" 
            placeholder="Buscar por descrição (em breve)..." 
            className="bg-transparent border-none outline-none text-sm text-text-primary h-10 w-full"
            disabled
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-text-muted" />
          <select 
            value={filterModulo} 
            onChange={e => setFilterModulo(e.target.value)}
            className="input h-10 py-0"
          >
            <option value="">Todos os Módulos</option>
            <option value="auth">Autenticação</option>
            <option value="configuracoes">Configurações</option>
            <option value="email">E-mail</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="financeiro">Financeiro</option>
          </select>
          
          <select 
            value={filterNivel} 
            onChange={e => setFilterNivel(e.target.value)}
            className="input h-10 py-0"
          >
            <option value="">Todos os Níveis</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.02] border-b border-white/[0.06]">
              <tr>
                <th className="p-4 font-medium text-text-muted w-40">Data/Hora</th>
                <th className="p-4 font-medium text-text-muted w-32">Usuário</th>
                <th className="p-4 font-medium text-text-muted w-32">Módulo</th>
                <th className="p-4 font-medium text-text-muted">Ação</th>
                <th className="p-4 font-medium text-text-muted w-24 text-center">Nível</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 size={24} className="animate-spin text-gold mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted">
                    Nenhum log encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                    <td className="p-4 text-xs text-text-secondary whitespace-nowrap">
                      {new Date(log.data_hora).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-text-primary text-xs truncate max-w-[120px]">{log.user_nome || 'Sistema'}</p>
                    </td>
                    <td className="p-4 text-xs text-text-muted uppercase tracking-wide">
                      {log.modulo}
                    </td>
                    <td className="p-4">
                      <p className="text-text-primary font-medium text-sm">{log.acao}</p>
                      {log.descricao && <p className="text-xs text-text-secondary mt-0.5">{log.descricao}</p>}
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "inline-flex badge text-[10px]",
                        log.nivel === 'info' ? "bg-info/10 text-info border-info/20" :
                        log.nivel === 'warning' ? "bg-warning/10 text-warning border-warning/20" :
                        "bg-danger/10 text-danger border-danger/20"
                      )}>
                        {log.nivel.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Upload, FileCode2, Search, Trash2, Eye, Box, FileText, Loader2, AlertCircle, CalendarDays, CheckCircle
} from 'lucide-react';
import { xmlService } from '@/services/xmlService';
import type { XmlFile, XmlItem } from '@/types';
import { cn, formatCurrency } from '@/lib/utils';

function XmlDetailsModal({ xmlId, onClose }: { xmlId: number; onClose: () => void }) {
  const [data, setData] = useState<{ xml: XmlFile; items: XmlItem[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    xmlService.getById(xmlId)
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [xmlId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative glass-card p-6 w-full max-w-4xl max-h-[90vh] flex flex-col animate-scale-in">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <FileCode2 size={20} className="text-info" /> Detalhes da Nota Fiscal
        </h2>

        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <Loader2 size={32} className="animate-spin text-info" />
          </div>
        ) : !data ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px] text-text-muted">
            Falha ao carregar detalhes.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
            {/* Cabecalho NF */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-bg-surface border border-white/[0.06] rounded-xl p-4">
              <div>
                <p className="text-[10px] text-text-muted uppercase mb-1">Fornecedor</p>
                <p className="text-sm font-semibold text-text-primary truncate" title={data.xml.fornecedor ?? ''}>{data.xml.fornecedor}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase mb-1">CNPJ Emitente</p>
                <p className="text-sm text-text-secondary">{data.xml.cnpj_emitente?.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase mb-1">Número NF / Data</p>
                <p className="text-sm text-text-secondary">
                  <span className="font-semibold text-text-primary mr-2">Nº {data.xml.numero_nf}</span>
                  {data.xml.data_emissao ? new Date(data.xml.data_emissao + 'T00:00:00').toLocaleDateString('pt-BR') : ''}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase mb-1">Valor Total</p>
                <p className="text-sm font-bold text-success">{formatCurrency(Number(data.xml.valor_total))}</p>
              </div>
              <div className="col-span-2 sm:col-span-4">
                <p className="text-[10px] text-text-muted uppercase mb-1">Chave de Acesso</p>
                <p className="text-xs font-mono text-text-secondary tracking-wider bg-white/5 p-1.5 rounded">{data.xml.chave_acesso}</p>
              </div>
            </div>

            {/* Itens */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Box size={16} className="text-gold" /> Itens da Nota ({data.items.length})
              </h3>
              <div className="space-y-4">
                {data.items.map(item => (
                  <div key={item.id} className="bg-bg-surface border border-white/[0.06] rounded-xl p-4">
                    <p className="text-sm font-bold text-gold mb-3">ITEM {String(item.numero_item).padStart(2, '0')}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] text-text-muted uppercase mb-1">Descrição</p>
                        <p className="text-sm font-medium text-text-primary">{item.descricao}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-text-muted uppercase mb-1">Código do Produto</p>
                        <p className="text-sm text-text-secondary font-mono">{item.codigo_produto || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-text-muted uppercase mb-1">Código de Barras</p>
                        <p className="text-sm text-text-secondary font-mono">{item.codigo_barras || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-text-muted uppercase mb-1">CFOP</p>
                        <p className="text-sm text-text-secondary font-mono">{item.cfop || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-text-muted uppercase mb-1">NCM</p>
                        <p className="text-sm text-text-secondary font-mono">{item.ncm || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-text-muted uppercase mb-1">Impostos (Origem/ICMS/IPI/cEnq/PIS/COFINS)</p>
                        <p className="text-sm text-text-secondary font-mono">
                          {(() => {
                            let cEnq = '999';
                            try {
                              const imposto = (item as any).impostos_raw;
                              if (imposto) {
                                let ipi = imposto.IPI;
                                if (Array.isArray(ipi)) ipi = ipi[0];
                                if (ipi && ipi.cEnq) {
                                  cEnq = Array.isArray(ipi.cEnq) ? ipi.cEnq[0] : ipi.cEnq;
                                }
                              }
                            } catch (e) {}
                            
                            return `${item.origem || '0'}/${item.cst_icms || '00'}/${item.cst_ipi || '00'}/${cEnq}/${item.cst_pis || '00'}/${item.cst_cofins || '00'}`;
                          })()}
                        </p>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn-secondary px-6">Fechar</button>
        </div>
      </div>
    </div>
  );
}

export default function XmlImporterPage() {
  const [items, setItems] = useState<XmlFile[]>([]);
  const [summary, setSummary] = useState({ total: 0, hoje: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [viewingXml, setViewingXml] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        xmlService.list({ search: search || undefined }),
        xmlService.summary()
      ]);
      setItems(listRes.data.items);
      setSummary(sumRes.data);
    } catch {}
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const delay = setTimeout(loadData, 300);
    return () => clearTimeout(delay);
  }, [loadData]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await xmlService.upload(file);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao importar XML.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este XML e todos os seus itens?')) return;
    try {
      await xmlService.delete(id);
      loadData();
    } catch {}
  };

  return (
    <div className="animate-fade-in">
      {viewingXml && (
        <XmlDetailsModal xmlId={viewingXml} onClose={() => setViewingXml(null)} />
      )}

      {/* Header */}
      <div className="page-header flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <FileCode2 size={20} className="text-info" /> Importador XML
          </h1>
          <p className="page-subtitle">Centralize e visualize suas Notas Fiscais Eletrônicas</p>
        </div>
        
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept=".xml,application/xml,text/xml"
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploading}
            className="btn-primary"
            style={{ backgroundColor: 'var(--color-info)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Importar XML
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-bg-elevated border border-white/[0.06] flex items-center justify-center text-text-primary">
            <FileCode2 size={24} />
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-0.5">Total Importado</p>
            <p className="text-2xl font-bold text-text-primary">{summary.total}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-info/10 border border-info/20 flex items-center justify-center text-info">
            <CalendarDays size={24} />
          </div>
          <div>
            <p className="text-xs text-info/70 uppercase tracking-wider mb-0.5">Importados Hoje</p>
            <p className="text-2xl font-bold text-info">{summary.hoje}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="relative mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Pesquisar por fornecedor, número da NF ou nome do arquivo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9 text-sm w-full max-w-md"
        />
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.02] border-b border-white/[0.06]">
              <tr>
                <th className="p-4 font-medium text-text-muted">Fornecedor / Arquivo</th>
                <th className="p-4 font-medium text-text-muted w-32">Nº NF / Emissão</th>
                <th className="p-4 font-medium text-text-muted text-right w-32">Valor Total</th>
                <th className="p-4 font-medium text-text-muted w-24 text-center">Status</th>
                <th className="p-4 font-medium text-text-muted w-20"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 size={24} className="animate-spin text-info mx-auto" />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="flex flex-col items-center">
                      <FileText size={32} className="text-text-muted mb-2" />
                      <p className="text-text-secondary">Nenhum XML importado</p>
                      <p className="text-xs text-text-muted mt-1">Clique em "Importar XML" para adicionar</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors group">
                    <td className="p-4">
                      <p className="font-semibold text-text-primary truncate" title={item.fornecedor ?? ''}>
                        {item.fornecedor ?? <span className="text-text-muted italic">Desconhecido</span>}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-text-muted bg-white/5 px-1.5 py-0.5 rounded truncate max-w-[200px]" title={item.nome_arquivo}>
                          {item.nome_arquivo}
                        </span>
                        {item.cnpj_emitente && (
                          <span className="text-[10px] text-text-secondary font-mono">
                            {item.cnpj_emitente.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-text-primary">Nº {item.numero_nf}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {item.data_emissao ? new Date(item.data_emissao + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-mono font-medium text-success">
                        {formatCurrency(Number(item.valor_total))}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 badge text-[10px] bg-success/10 text-success border-success/20">
                        <CheckCircle size={10} /> Importado
                      </span>
                    </td>
                    <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setViewingXml(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-info hover:bg-info/10 transition-colors" title="Ver Detalhes">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-colors" title="Excluir">
                          <Trash2 size={16} />
                        </button>
                      </div>
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

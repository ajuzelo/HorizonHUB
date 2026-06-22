import { useState, useEffect } from 'react';
import { 
  MessageCircle, History, FileText, Send, 
  Trash2, Loader2, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { whatsappTemplatesService } from '@/services/whatsappTemplatesService';
import { whatsappHistoryService } from '@/services/whatsappHistoryService';
import { settingsService } from '@/services/settingsService';
import { nfClientsService } from '@/services/nfClientsService';
import type { WhatsappTemplate, WhatsappHistory, NfClient, Settings } from '@/types';

function DisparoTab({ templates, clients, settings, onSent }: { templates: WhatsappTemplate[], clients: NfClient[], settings: Settings | null, onSent: () => void }) {
  const [clientId, setClientId] = useState('');
  const [telefone, setTelefone] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [sending, setSending] = useState(false);

  // When client changes
  useEffect(() => {
    if (clientId) {
      const c = clients.find(x => String(x.id) === clientId);
      if (c) {
        setClienteNome(c.nome);
        setTelefone(c.telefone || '');
      }
    }
  }, [clientId, clients]);

  // When template changes
  useEffect(() => {
    if (templateId) {
      const t = templates.find(x => String(x.id) === templateId);
      if (t) {
        let msg = t.mensagem;
        msg = msg.replace(/{{nome}}/g, clienteNome);
        setMensagem(msg);
      }
    }
  }, [templateId, templates, clienteNome]);

  const handleSend = async () => {
    if (!telefone || !mensagem) return alert('Preencha o telefone e a mensagem.');
    
    setSending(true);
    const modo = settings?.whatsapp_modo || 'web';
    
    try {
      // Registrar no histórico
      await whatsappHistoryService.logSend({
        telefone,
        cliente: clienteNome || undefined,
        mensagem,
        modo,
        status: modo === 'web' ? 'enviado' : 'aberto', // In web mode, we assume sent if they clicked. API would be queued.
      });

      if (modo === 'web') {
        // Formatar telefone: remover tudo que não é número
        const num = telefone.replace(/\D/g, '');
        const text = encodeURIComponent(mensagem);
        window.open(`https://wa.me/${num}?text=${text}`, '_blank');
      } else {
        alert('Modo API selecionado. O envio seria processado pelo backend integrado.');
        // Backend integration logic would go here
      }
      
      setClientId('');
      setTelefone('');
      setClienteNome('');
      setTemplateId('');
      setMensagem('');
      onSent();
    } catch (err) {
      alert('Erro ao registrar envio.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <div className="space-y-4">
        <div className="card p-5">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <MessageCircle size={18} className="text-success" /> Destinatário
          </h3>
          <div className="space-y-4">
            <div>
              <label className="input-label">Selecionar Cliente (Opcional)</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)} className="input">
                <option value="">-- Número Avulso --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Nome do Cliente (Para variáveis)</label>
                <input type="text" value={clienteNome} onChange={e => setClienteNome(e.target.value)} className="input" placeholder="Ex: João" />
              </div>
              <div>
                <label className="input-label">WhatsApp (com DDI e DDD) *</label>
                <input type="text" value={telefone} onChange={e => setTelefone(e.target.value)} className="input" placeholder="5511999999999" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5 flex flex-col h-full">
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Send size={18} className="text-success" /> Mensagem
        </h3>
        <div className="space-y-4 flex-1 flex flex-col">
          <div>
            <label className="input-label">Usar Modelo de Mensagem</label>
            <select value={templateId} onChange={e => setTemplateId(e.target.value)} className="input">
              <option value="">-- Escrever Manualmente --</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div className="flex-1 flex flex-col min-h-[200px]">
            <label className="input-label">Conteúdo *</label>
            <textarea value={mensagem} onChange={e => setMensagem(e.target.value)} className="input flex-1 resize-none" placeholder="Olá, tudo bem?" />
          </div>
        </div>

        <button 
          onClick={handleSend} 
          disabled={sending || !telefone || !mensagem}
          className="btn-primary w-full mt-4 h-12 text-base font-medium"
          style={{ backgroundColor: 'var(--color-success)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          {settings?.whatsapp_modo === 'api' ? 'Enviar via API' : 'Abrir no WhatsApp Web'}
        </button>
      </div>
    </div>
  );
}

function HistoryTab() {
  const [history, setHistory] = useState<WhatsappHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    whatsappHistoryService.listHistory().then(res => setHistory(res.data.items)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="card overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.02] border-b border-white/[0.06]">
            <tr>
              <th className="p-4 font-medium text-text-muted">Data</th>
              <th className="p-4 font-medium text-text-muted">Contato</th>
              <th className="p-4 font-medium text-text-muted">Mensagem</th>
              <th className="p-4 font-medium text-text-muted w-32 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center"><Loader2 size={24} className="animate-spin text-success mx-auto" /></td></tr>
            ) : history.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-text-muted">Nenhum envio registrado.</td></tr>
            ) : (
              history.map(item => (
                <tr key={item.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                  <td className="p-4 text-xs text-text-secondary whitespace-nowrap">
                    {new Date(item.data_envio).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-text-primary">{item.cliente || 'Desconhecido'}</p>
                    <p className="text-xs text-text-muted">{item.telefone}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-text-secondary line-clamp-2 max-w-sm text-xs" title={item.mensagem}>{item.mensagem}</p>
                    <span className="text-[10px] text-text-muted mt-1 uppercase">Modo: {item.modo}</span>
                  </td>
                  <td className="p-4 text-center">
                    {item.status === 'enviado' ? (
                      <span className="inline-flex items-center gap-1 badge text-[10px] bg-success/10 text-success border-success/20">
                        <CheckCircle2 size={10} /> Enviado
                      </span>
                    ) : item.status === 'erro' ? (
                      <span className="inline-flex items-center gap-1 badge text-[10px] bg-danger/10 text-danger border-danger/20">
                        <XCircle size={10} /> Falha
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 badge text-[10px] bg-warning/10 text-warning border-warning/20">
                        <Clock size={10} /> Aberto
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TemplatesTab({ templates, onUpdate }: { templates: WhatsappTemplate[], onUpdate: () => void }) {
  const [nome, setNome] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!nome || !mensagem) return;
    setLoading(true);
    try {
      await whatsappTemplatesService.create({ nome, mensagem });
      setNome(''); setMensagem('');
      onUpdate();
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir modelo?')) return;
    await whatsappTemplatesService.delete(id);
    onUpdate();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-1 card p-5 h-fit">
        <h3 className="font-semibold text-text-primary mb-4">Novo Modelo</h3>
        <div className="space-y-4">
          <div><label className="input-label">Nome do Modelo (Uso Interno) *</label><input type="text" value={nome} onChange={e=>setNome(e.target.value)} className="input" /></div>
          <div>
            <label className="input-label">Mensagem (Use {'{{nome}}'} para cliente) *</label>
            <textarea value={mensagem} onChange={e=>setMensagem(e.target.value)} className="input resize-none h-32" />
          </div>
          <button onClick={handleAdd} disabled={loading || !nome || !mensagem} className="btn-primary w-full" style={{backgroundColor: 'var(--color-success)'}}>Adicionar</button>
        </div>
      </div>
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
        {templates.map(t => (
          <div key={t.id} className="card p-4 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0"><FileText size={16}/></div>
                <h4 className="font-semibold text-text-primary">{t.nome}</h4>
              </div>
              <button onClick={() => handleDelete(t.id)} className="text-text-muted hover:text-danger"><Trash2 size={16}/></button>
            </div>
            <div className="mt-2 bg-bg-surface p-3 rounded-lg text-xs text-text-muted border border-white/[0.03] whitespace-pre-wrap">
              {t.mensagem}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WhatsAppPage() {
  const [activeTab, setActiveTab] = useState<'disparo' | 'historico' | 'modelos'>('disparo');
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [clients, setClients] = useState<NfClient[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  const loadData = () => {
    whatsappTemplatesService.list().then(res => setTemplates(res.data.items));
    nfClientsService.list().then(res => setClients(res.data.items));
    settingsService.getSettings().then(res => setSettings(res.data));
  };

  useEffect(() => { loadData(); }, []);

  const tabs = [
    { id: 'disparo', label: 'Novo Disparo', icon: Send },
    { id: 'historico', label: 'Histórico', icon: History },
    { id: 'modelos', label: 'Modelos', icon: FileText },
  ] as const;

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto">
      <div className="page-header mb-8">
        <h1 className="page-title flex items-center gap-2">
          <MessageCircle size={24} className="text-success" /> WhatsApp
        </h1>
        <p className="page-subtitle">Dispare mensagens rápidas para clientes ou contatos avulsos</p>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 border-b border-white/[0.06] pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                isActive ? 'bg-success/10 text-success' : 'text-text-muted hover:text-text-primary hover:bg-white/[0.02]'
              )}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'disparo' && <DisparoTab templates={templates} clients={clients} settings={settings} onSent={() => setActiveTab('historico')} />}
      {activeTab === 'historico' && <HistoryTab />}
      {activeTab === 'modelos' && <TemplatesTab templates={templates} onUpdate={loadData} />}
    </div>
  );
}

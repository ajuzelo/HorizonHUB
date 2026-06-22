import { useState, useEffect, useRef } from 'react';
import { 
  Send, History, Users, FileText, Upload, Plus, Search, 
  Trash2, Loader2, CheckCircle2, XCircle, FileIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { nfClientsService } from '@/services/nfClientsService';
import { emailTemplatesService } from '@/services/emailTemplatesService';
import { emailService } from '@/services/emailService';
import type { NfClient, EmailTemplate, EmailHistory } from '@/types';

function EnvioTab({ clients, templates, onSent }: { clients: NfClient[], templates: EmailTemplate[], onSent: () => void }) {
  const [clientId, setClientId] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [emailDestino, setEmailDestino] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [assunto, setAssunto] = useState('');
  const [corpo, setCorpo] = useState('');
  const [nfProduto, setNfProduto] = useState('');
  const [nfServico, setNfServico] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When client changes
  useEffect(() => {
    if (clientId) {
      const c = clients.find(x => String(x.id) === clientId);
      if (c) {
        setClienteNome(c.nome);
        setEmailDestino(c.email || '');
      }
    }
  }, [clientId, clients]);

  // When template changes
  useEffect(() => {
    if (templateId) {
      const t = templates.find(x => String(x.id) === templateId);
      if (t) {
        setAssunto(t.assunto);
        let parsedCorpo = t.corpo;
        parsedCorpo = parsedCorpo.replace(/{{nome}}/g, clienteNome);
        setCorpo(parsedCorpo);
      }
    }
  }, [templateId, templates, clienteNome]);

  const handleSend = async () => {
    if (!clienteNome || !emailDestino || !assunto || !corpo) return alert('Preencha os campos obrigatórios.');
    
    setSending(true);
    try {
      await emailService.send({
        client_id: clientId || undefined,
        cliente_nome: clienteNome,
        email_destino: emailDestino,
        assunto,
        corpo,
        numero_nf_produto: nfProduto,
        numero_nf_servico: nfServico,
        attachments
      });
      alert('E-mail enviado com sucesso!');
      
      // Clear form
      setClientId('');
      setClienteNome('');
      setEmailDestino('');
      setTemplateId('');
      setAssunto('');
      setCorpo('');
      setNfProduto('');
      setNfServico('');
      setAttachments([]);
      onSent();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao enviar e-mail. Verifique suas configurações SMTP.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <div className="space-y-4">
        <div className="card p-5">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Users size={18} className="text-info" /> Destinatário
          </h3>
          <div className="space-y-4">
            <div>
              <label className="input-label">Selecionar Cliente Cadastrado (Opcional)</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)} className="input">
                <option value="">-- Avulso --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Nome do Cliente *</label>
                <input type="text" value={clienteNome} onChange={e => setClienteNome(e.target.value)} className="input" placeholder="Razão Social" />
              </div>
              <div>
                <label className="input-label">E-mail *</label>
                <input type="email" value={emailDestino} onChange={e => setEmailDestino(e.target.value)} className="input" placeholder="contato@..." />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <FileText size={18} className="text-info" /> Dados da NF
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Número NF Produto (Opcional)</label>
              <input type="text" value={nfProduto} onChange={e => setNfProduto(e.target.value)} className="input" placeholder="Ex: 12345" />
            </div>
            <div>
              <label className="input-label">Número NF Serviço (Opcional)</label>
              <input type="text" value={nfServico} onChange={e => setNfServico(e.target.value)} className="input" placeholder="Ex: 6789" />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="input-label">Anexos (PDFs, XMLs, Boletos)</label>
            <div className="flex gap-2 mb-2">
              <input type="file" multiple ref={fileInputRef} onChange={e => setAttachments(Array.from(e.target.files || []))} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="btn-secondary w-full py-4 border-dashed border-2 flex items-center justify-center gap-2">
                <Upload size={16} /> Selecionar Arquivos
              </button>
            </div>
            {attachments.length > 0 && (
              <ul className="space-y-1">
                {attachments.map((f, i) => (
                  <li key={i} className="flex justify-between items-center text-xs text-text-secondary bg-white/5 p-2 rounded">
                    <span className="flex items-center gap-1 truncate"><FileIcon size={12} /> {f.name}</span>
                    <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-text-muted hover:text-danger"><XCircle size={14} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="card p-5 flex flex-col h-full">
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Send size={18} className="text-info" /> Mensagem
        </h3>
        <div className="space-y-4 flex-1 flex flex-col">
          <div>
            <label className="input-label">Usar Modelo de E-mail</label>
            <select value={templateId} onChange={e => setTemplateId(e.target.value)} className="input">
              <option value="">-- Mensagem em Branco --</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Assunto *</label>
            <input type="text" value={assunto} onChange={e => setAssunto(e.target.value)} className="input" />
          </div>
          <div className="flex-1 flex flex-col min-h-[200px]">
            <label className="input-label">Corpo do E-mail (HTML permitido) *</label>
            <textarea value={corpo} onChange={e => setCorpo(e.target.value)} className="input flex-1 resize-none" placeholder="<p>Prezado cliente...</p>" />
          </div>
        </div>

        <button 
          onClick={handleSend} 
          disabled={sending || !clienteNome || !emailDestino || !assunto || !corpo}
          className="btn-primary w-full mt-4 h-12 text-base font-medium"
          style={{ backgroundColor: 'var(--color-info)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          Disparar E-mail
        </button>
      </div>
    </div>
  );
}

function HistoryTab() {
  const [history, setHistory] = useState<EmailHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    emailService.listHistory().then(res => setHistory(res.data.items)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="card overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.02] border-b border-white/[0.06]">
            <tr>
              <th className="p-4 font-medium text-text-muted">Data</th>
              <th className="p-4 font-medium text-text-muted">Cliente / E-mail</th>
              <th className="p-4 font-medium text-text-muted">Assunto</th>
              <th className="p-4 font-medium text-text-muted w-32 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center"><Loader2 size={24} className="animate-spin text-info mx-auto" /></td></tr>
            ) : history.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-text-muted">Nenhum envio realizado.</td></tr>
            ) : (
              history.map(item => (
                <tr key={item.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                  <td className="p-4 text-xs text-text-secondary">
                    {new Date(item.data_envio).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-text-primary">{item.cliente}</p>
                    <p className="text-xs text-text-muted">{item.email_destino}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-text-primary truncate max-w-[250px]" title={item.assunto}>{item.assunto}</p>
                    {item.anexos && item.anexos !== '[]' && (
                      <p className="text-[10px] text-text-muted mt-0.5">Com anexos</p>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {item.status === 'enviado' ? (
                      <span className="inline-flex items-center gap-1 badge text-[10px] bg-success/10 text-success border-success/20">
                        <CheckCircle2 size={10} /> Enviado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 badge text-[10px] bg-danger/10 text-danger border-danger/20" title={item.erro_detalhe || 'Erro'}>
                        <XCircle size={10} /> Falha
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

function ClientsTab({ clients, onUpdate }: { clients: NfClient[], onUpdate: () => void }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!nome) return;
    setLoading(true);
    try {
      await nfClientsService.create({ nome, email, cnpj_cpf: cnpj });
      setNome(''); setEmail(''); setCnpj('');
      onUpdate();
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir cliente?')) return;
    await nfClientsService.delete(id);
    onUpdate();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-1 card p-5 h-fit">
        <h3 className="font-semibold text-text-primary mb-4">Adicionar Cliente</h3>
        <div className="space-y-4">
          <div><label className="input-label">Razão Social *</label><input type="text" value={nome} onChange={e=>setNome(e.target.value)} className="input" /></div>
          <div><label className="input-label">E-mail</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="input" /></div>
          <div><label className="input-label">CNPJ / CPF</label><input type="text" value={cnpj} onChange={e=>setCnpj(e.target.value)} className="input" /></div>
          <button onClick={handleAdd} disabled={loading || !nome} className="btn-primary w-full">Adicionar</button>
        </div>
      </div>
      <div className="lg:col-span-2 card overflow-hidden h-fit">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.02] border-b border-white/[0.06]">
            <tr><th className="p-4">Nome</th><th className="p-4">E-mail</th><th className="p-4">CNPJ</th><th className="p-4 w-12"></th></tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id} className="border-b border-white/[0.03]">
                <td className="p-4 text-text-primary font-medium">{c.nome}</td>
                <td className="p-4 text-text-secondary">{c.email || '-'}</td>
                <td className="p-4 text-text-secondary">{c.cnpj_cpf || '-'}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(c.id)} className="text-text-muted hover:text-danger"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TemplatesTab({ templates, onUpdate }: { templates: EmailTemplate[], onUpdate: () => void }) {
  const [nome, setNome] = useState('');
  const [assunto, setAssunto] = useState('');
  const [corpo, setCorpo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!nome || !assunto || !corpo) return;
    setLoading(true);
    try {
      await emailTemplatesService.create({ nome, assunto, corpo });
      setNome(''); setAssunto(''); setCorpo('');
      onUpdate();
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir modelo?')) return;
    await emailTemplatesService.delete(id);
    onUpdate();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-1 card p-5 h-fit">
        <h3 className="font-semibold text-text-primary mb-4">Novo Modelo</h3>
        <div className="space-y-4">
          <div><label className="input-label">Nome do Modelo (Uso Interno) *</label><input type="text" value={nome} onChange={e=>setNome(e.target.value)} className="input" /></div>
          <div><label className="input-label">Assunto Padrão *</label><input type="text" value={assunto} onChange={e=>setAssunto(e.target.value)} className="input" /></div>
          <div>
            <label className="input-label">Corpo (Use {'{{nome}}'} para cliente) *</label>
            <textarea value={corpo} onChange={e=>setCorpo(e.target.value)} className="input resize-none h-32" />
          </div>
          <button onClick={handleAdd} disabled={loading || !nome || !assunto || !corpo} className="btn-primary w-full">Adicionar</button>
        </div>
      </div>
      <div className="lg:col-span-2 space-y-4 h-fit">
        {templates.map(t => (
          <div key={t.id} className="card p-4 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0"><FileText size={20}/></div>
            <div className="flex-1">
              <h4 className="font-semibold text-text-primary">{t.nome}</h4>
              <p className="text-sm text-text-secondary mt-1"><span className="text-text-muted">Assunto:</span> {t.assunto}</p>
              <div className="mt-2 bg-bg-surface p-2 rounded text-xs text-text-muted border border-white/[0.03] max-h-20 overflow-hidden line-clamp-3">
                {t.corpo}
              </div>
            </div>
            <button onClick={() => handleDelete(t.id)} className="text-text-muted hover:text-danger"><Trash2 size={16}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NfCentralPage() {
  const [activeTab, setActiveTab] = useState<'envio' | 'historico' | 'clientes' | 'modelos'>('envio');
  const [clients, setClients] = useState<NfClient[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  const loadData = () => {
    nfClientsService.list().then(res => setClients(res.data.items));
    emailTemplatesService.list().then(res => setTemplates(res.data.items));
  };

  useEffect(() => { loadData(); }, []);

  const tabs = [
    { id: 'envio', label: 'Novo Envio', icon: Send },
    { id: 'historico', label: 'Histórico', icon: History },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'modelos', label: 'Modelos', icon: FileText },
  ] as const;

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto">
      <div className="page-header mb-8">
        <h1 className="page-title flex items-center gap-2">
          <Send size={24} className="text-info" /> Central de NF & E-mail
        </h1>
        <p className="page-subtitle">Dispare Notas Fiscais e comunicados para seus clientes</p>
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
                isActive ? 'bg-info/10 text-info' : 'text-text-muted hover:text-text-primary hover:bg-white/[0.02]'
              )}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'envio' && <EnvioTab clients={clients} templates={templates} onSent={() => setActiveTab('historico')} />}
      {activeTab === 'historico' && <HistoryTab />}
      {activeTab === 'clientes' && <ClientsTab clients={clients} onUpdate={loadData} />}
      {activeTab === 'modelos' && <TemplatesTab templates={templates} onUpdate={loadData} />}
    </div>
  );
}

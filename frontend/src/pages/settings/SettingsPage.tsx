import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Mail, Save, Loader2, Server, Key, User, Database } from 'lucide-react';
import { settingsService } from '@/services/settingsService';
import api from '@/services/api';
import type { Settings } from '@/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // SMTP Form State
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpEmail, setSmtpEmail] = useState('');
  const [smtpSenha, setSmtpSenha] = useState('');
  const [smtpNome, setSmtpNome] = useState('');
  const [smtpSsl, setSmtpSsl] = useState(false);

  // WhatsApp Form State
  const [waModo, setWaModo] = useState<'web' | 'api'>('web');
  const [waToken, setWaToken] = useState('');
  const [savingWa, setSavingWa] = useState(false);

  useEffect(() => {
    settingsService.getSettings()
      .then(res => {
        const s = res.data;
        setSettings(s);
        setSmtpHost(s.smtp_host || '');
        setSmtpPort(s.smtp_port ? String(s.smtp_port) : '');
        setSmtpEmail(s.smtp_email || '');
        setSmtpNome(s.smtp_nome_remetente || '');
        setSmtpSsl(s.smtp_ssl);
        setWaModo(s.whatsapp_modo || 'web');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSmtp = async () => {
    setSaving(true);
    try {
      const res = await settingsService.updateSmtp({
        smtp_host: smtpHost,
        smtp_port: Number(smtpPort),
        smtp_email: smtpEmail,
        smtp_senha: smtpSenha || undefined,
        smtp_nome_remetente: smtpNome,
        smtp_ssl: smtpSsl,
      });
      setSettings(res.data.settings);
      setSmtpSenha('');
      alert('Configurações SMTP salvas com sucesso!');
    } catch {
      alert('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWa = async () => {
    setSavingWa(true);
    try {
      const res = await settingsService.updateWhatsapp({
        whatsapp_modo: waModo,
        whatsapp_api_token: waToken || undefined,
      });
      setSettings(res.data.settings);
      setWaToken('');
      alert('Configurações do WhatsApp salvas com sucesso!');
    } catch {
      alert('Erro ao salvar configurações do WhatsApp.');
    } finally {
      setSavingWa(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-12">
      <div className="page-header mb-8">
        <h1 className="page-title flex items-center gap-2">
          <SettingsIcon size={24} className="text-gold" /> Configurações
        </h1>
        <p className="page-subtitle">Gerencie as preferências e integrações do sistema</p>
      </div>

      <div className="space-y-6">
        {/* Sessão SMTP */}
        <section className="card overflow-hidden border border-white/[0.06]">
          <div className="bg-white/[0.02] p-4 border-b border-white/[0.06] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center text-info">
              <Mail size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">Servidor de E-mail (SMTP)</h2>
              <p className="text-xs text-text-muted">Configure o remetente para a Central de NF</p>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <div className="p-4 rounded-xl bg-info/5 border border-info/20 text-sm text-info/90 flex gap-3">
                <Server className="shrink-0 mt-0.5" size={18} />
                <p>
                  Para utilizar a <strong>Central de NF</strong>, você precisa configurar um servidor SMTP (como Gmail, Outlook, ou seu servidor próprio). Se usar o Gmail, lembre-se de gerar uma "Senha de App" nas configurações de segurança do Google.
                </p>
              </div>
            </div>

            <div>
              <label className="input-label">Servidor SMTP (Host)</label>
              <input
                type="text"
                value={smtpHost}
                onChange={e => setSmtpHost(e.target.value)}
                placeholder="Ex: smtp.gmail.com"
                className="input"
              />
            </div>
            <div>
              <label className="input-label">Porta</label>
              <input
                type="number"
                value={smtpPort}
                onChange={e => setSmtpPort(e.target.value)}
                placeholder="Ex: 465 ou 587"
                className="input"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="input-label">Nome do Remetente</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={smtpNome}
                  onChange={e => setSmtpNome(e.target.value)}
                  placeholder="Ex: Horizon HUB"
                  className="input pl-9"
                />
              </div>
            </div>

            <div>
              <label className="input-label">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={smtpEmail}
                  onChange={e => setSmtpEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="input pl-9"
                />
              </div>
            </div>

            <div>
              <label className="input-label">
                Senha {settings?.has_smtp_senha && <span className="text-success text-[10px] ml-2">(Salva)</span>}
              </label>
              <div className="relative">
                <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  value={smtpSenha}
                  onChange={e => setSmtpSenha(e.target.value)}
                  placeholder={settings?.has_smtp_senha ? '••••••••' : 'Sua senha'}
                  className="input pl-9"
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smtpSsl}
                  onChange={e => setSmtpSsl(e.target.checked)}
                  className="rounded border-white/10 bg-black/20 text-info focus:ring-info focus:ring-offset-bg-base"
                />
                <span className="text-sm text-text-secondary">Usar conexão segura (SSL/TLS)</span>
              </label>

              <button
                onClick={handleSaveSmtp}
                disabled={saving || !smtpHost || !smtpPort || !smtpEmail || (!settings?.has_smtp_senha && !smtpSenha)}
                className="btn-primary"
                style={{ backgroundColor: 'var(--color-info)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Salvar SMTP
              </button>
            </div>
          </div>
        </section>

        {/* Sessão WhatsApp */}
        <section className="card overflow-hidden border border-white/[0.06]">
          <div className="bg-white/[0.02] p-4 border-b border-white/[0.06] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <span className="font-bold text-xl">W</span>
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">WhatsApp</h2>
              <p className="text-xs text-text-muted">Configure o modo de envio do módulo de WhatsApp</p>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="input-label">Modo de Operação</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={waModo === 'web'}
                    onChange={() => setWaModo('web')}
                    className="text-success focus:ring-success border-white/20 bg-transparent"
                  />
                  <span className="text-sm text-text-primary">WhatsApp Web (Abre aba para envio manual)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={waModo === 'api'}
                    onChange={() => setWaModo('api')}
                    className="text-success focus:ring-success border-white/20 bg-transparent"
                  />
                  <span className="text-sm text-text-primary">Integração API (Z-API, Evolution, etc)</span>
                </label>
              </div>
            </div>

            {waModo === 'api' && (
              <div className="col-span-1 md:col-span-2">
                <label className="input-label">
                  Token da API {settings?.has_whatsapp_token && <span className="text-success text-[10px] ml-2">(Salvo)</span>}
                </label>
                <div className="relative mt-1">
                  <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="password"
                    value={waToken}
                    onChange={e => setWaToken(e.target.value)}
                    placeholder={settings?.has_whatsapp_token ? '••••••••' : 'Cole seu Token aqui'}
                    className="input pl-9"
                  />
                </div>
                <p className="text-xs text-text-muted mt-2">O envio por API requer uma plataforma compatível configurada no servidor.</p>
              </div>
            )}

            <div className="col-span-1 md:col-span-2 flex items-center justify-end mt-2">
              <button
                onClick={handleSaveWa}
                disabled={savingWa}
                className="btn-primary"
                style={{ backgroundColor: 'var(--color-success)', color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                {savingWa ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Salvar WhatsApp
              </button>
            </div>
          </div>
        </section>

        {/* Sessão de Backup */}
        <section className="card overflow-hidden border border-white/[0.06]">
          <div className="bg-white/[0.02] p-4 border-b border-white/[0.06] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
              <Database size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">Sistema e Backup</h2>
              <p className="text-xs text-text-muted">Gere e faça download do backup do banco de dados</p>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-sm text-text-muted mb-6">
              Faça o download de uma cópia completa de segurança (dump) do seu banco de dados PostgreSQL.
              Este arquivo conterá todas as tabelas e dados da aplicação e pode ser restaurado posteriormente.
            </p>

            <div className="bg-bg-base border border-white/[0.06] rounded-xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-info/10 text-info flex items-center justify-center flex-shrink-0 mt-1">
                  <Database size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">Backup Manual</h4>
                  <p className="text-sm text-text-muted mt-1">
                    Clique no botão abaixo para gerar e baixar um arquivo .sql com seus dados. 
                    Dependendo do tamanho do banco, isso pode levar alguns segundos.
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={async () => {
                setSaving(true);
                try {
                  const response = await api.get('/settings/backup/download', { responseType: 'blob' });
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', 'backup_horizon.sql');
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  alert('Erro ao baixar o backup. O utilitário pg_dump pode não estar instalado ou configurado no servidor.');
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? <><Loader2 size={16} className="animate-spin" /> Gerando arquivo...</> : <><Database size={16} /> Gerar e Baixar Backup</>}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { 
  Wallet, PieChart, ArrowUpCircle, ArrowDownCircle, 
  CreditCard, Target, Tags, Plus, Trash2, Loader2,
  CheckCircle2, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { personalCategoriesService } from '@/services/personalCategoriesService';
import { personalWalletsService } from '@/services/personalWalletsService';
import { personalCardsService } from '@/services/personalCardsService';
import { personalAccountsService } from '@/services/personalAccountsService';
import { personalGoalsService } from '@/services/personalGoalsService';
import type { 
  PersonalCategory, PersonalWallet, PersonalCard, 
  PersonalAccount, PersonalGoal 
} from '@/types';

// Utils
const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

// TABS COMPONENTS

function OverviewTab({ accounts, wallets, cards }: { accounts: PersonalAccount[], wallets: PersonalWallet[], cards: PersonalCard[] }) {
  const saldoTotalCarteiras = wallets.reduce((acc, w) => acc + (w.saldo_atual || 0), 0);
  const totalFaturas = cards.reduce((acc, c) => acc + (c.fatura_atual || 0), 0);
  
  const receitasMes = accounts.filter(a => a.tipo === 'receita' && a.status === 'recebido').reduce((acc, a) => acc + a.valor, 0);
  const despesasMes = accounts.filter(a => a.tipo === 'despesa' && a.status === 'pago').reduce((acc, a) => acc + a.valor, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-l-info">
          <p className="text-sm text-text-muted">Saldo em Contas</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{formatCurrency(saldoTotalCarteiras)}</p>
        </div>
        <div className="card p-5 border-l-4 border-l-danger">
          <p className="text-sm text-text-muted">Faturas Abertas</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{formatCurrency(totalFaturas)}</p>
        </div>
        <div className="card p-5 border-l-4 border-l-success">
          <p className="text-sm text-text-muted">Receitas Pagas (Mês)</p>
          <p className="text-2xl font-bold text-success mt-1">{formatCurrency(receitasMes)}</p>
        </div>
        <div className="card p-5 border-l-4 border-l-warning">
          <p className="text-sm text-text-muted">Despesas Pagas (Mês)</p>
          <p className="text-2xl font-bold text-warning mt-1">{formatCurrency(despesasMes)}</p>
        </div>
      </div>
      <div className="card p-8 text-center text-text-muted border-dashed border-2">
        <PieChart size={48} className="mx-auto text-white/10 mb-4" />
        <p>Os gráficos detalhados de evolução de patrimônio estarão disponíveis nas próximas atualizações.</p>
      </div>
    </div>
  );
}

function TransactionsTab({ accounts, wallets, cards, categories, onUpdate }: any) {
  const [showModal, setShowModal] = useState(false);
  const [tipoLancamento, setTipoLancamento] = useState<'receita'|'despesa'>('despesa');
  
  // Form State
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataMovimento, setDataMovimento] = useState(new Date().toISOString().split('T')[0]);
  const [catId, setCatId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [cardId, setCardId] = useState('');
  const [status, setStatus] = useState('pendente');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if(!descricao || !valor || !dataMovimento) return;
    setLoading(true);
    try {
      await personalAccountsService.create({
        descricao, valor: Number(valor), data_movimento: dataMovimento,
        tipo: tipoLancamento, status: status as any,
        category_id: catId ? Number(catId) : undefined,
        wallet_id: walletId ? Number(walletId) : undefined,
        card_id: cardId ? Number(cardId) : undefined,
      });
      setShowModal(false);
      onUpdate();
    } finally { setLoading(false); }
  };

  const handleToggle = async (id: number) => {
    await personalAccountsService.toggleStatus(id);
    onUpdate();
  };

  const handleDelete = async (id: number) => {
    if(!confirm('Excluir lançamento?')) return;
    await personalAccountsService.delete(id);
    onUpdate();
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex gap-2">
        <button onClick={() => { setTipoLancamento('receita'); setShowModal(true); }} className="btn-primary flex items-center gap-2 bg-success hover:bg-success/90 border-transparent text-white">
          <ArrowUpCircle size={16} /> Nova Receita
        </button>
        <button onClick={() => { setTipoLancamento('despesa'); setShowModal(true); }} className="btn-primary flex items-center gap-2 bg-danger hover:bg-danger/90 border-transparent text-white">
          <ArrowDownCircle size={16} /> Nova Despesa
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.02] border-b border-white/[0.06]">
            <tr>
              <th className="p-4">Data</th>
              <th className="p-4">Descrição</th>
              <th className="p-4">Categoria / Conta</th>
              <th className="p-4 text-right">Valor</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a: PersonalAccount) => {
              const cat = categories.find((c:any) => c.id === a.category_id);
              const wal = wallets.find((w:any) => w.id === a.wallet_id);
              const car = cards.find((c:any) => c.id === a.card_id);
              
              return (
                <tr key={a.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                  <td className="p-4 text-text-secondary">{new Date(a.data_movimento).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 font-medium text-text-primary">{a.descricao}</td>
                  <td className="p-4 text-xs text-text-muted">
                    <p>{cat?.nome || 'Sem categoria'}</p>
                    <p className="text-[10px] mt-0.5">{wal?.nome || car?.nome || '-'}</p>
                  </td>
                  <td className={cn("p-4 text-right font-medium", a.tipo === 'receita' ? 'text-success' : 'text-danger')}>
                    {a.tipo === 'receita' ? '+' : '-'}{formatCurrency(a.valor)}
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleToggle(a.id)} className={cn(
                      "badge text-[10px] cursor-pointer hover:opacity-80 transition-opacity",
                      a.status === 'pendente' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-success/10 text-success border-success/20'
                    )}>
                      {a.status === 'pendente' ? <Clock size={10} className="inline mr-1"/> : <CheckCircle2 size={10} className="inline mr-1"/>}
                      {a.status.toUpperCase()}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(a.id)} className="text-text-muted hover:text-danger"><Trash2 size={16}/></button>
                  </td>
                </tr>
              );
            })}
            {accounts.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-text-muted">Nenhum lançamento encontrado.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Simplified Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-bg-surface w-full max-w-md rounded-xl border border-white/10 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Novo Lançamento ({tipoLancamento})</h3>
            <div className="space-y-4">
              <div><label className="input-label">Descrição</label><input type="text" value={descricao} onChange={e=>setDescricao(e.target.value)} className="input"/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="input-label">Valor (R$)</label><input type="number" value={valor} onChange={e=>setValor(e.target.value)} className="input"/></div>
                <div><label className="input-label">Data</label><input type="date" value={dataMovimento} onChange={e=>setDataMovimento(e.target.value)} className="input"/></div>
              </div>
              <div>
                <label className="input-label">Categoria</label>
                <select value={catId} onChange={e=>setCatId(e.target.value)} className="input">
                  <option value="">-- Selecione --</option>
                  {categories.filter((c:any) => c.tipo === tipoLancamento || c.tipo === 'ambos').map((c:any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Carteira/Conta</label>
                  <select value={walletId} onChange={e=>setWalletId(e.target.value)} className="input">
                    <option value="">-- Nenhuma --</option>
                    {wallets.map((w:any) => <option key={w.id} value={w.id}>{w.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Cartão de Crédito</label>
                  <select value={cardId} onChange={e=>setCardId(e.target.value)} className="input" disabled={!!walletId || tipoLancamento === 'receita'}>
                    <option value="">-- Nenhum --</option>
                    {cards.map((c:any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
                <button onClick={handleSave} disabled={loading || !descricao || !valor} className="btn-primary flex-1">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Outras abas simplificadas para evitar arquivo gigantesco (podemos expandir se precisar)
function ContasTab({ wallets, cards, onUpdate }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <div className="card p-5">
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2"><Wallet size={18} className="text-info"/> Carteiras e Contas</h3>
        <div className="space-y-2">
          {wallets.map((w:any) => (
            <div key={w.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
              <div><p className="font-medium text-sm text-text-primary">{w.nome}</p><p className="text-[10px] text-text-muted uppercase">{w.tipo}</p></div>
              <p className="font-semibold text-info">{formatCurrency(w.saldo_atual)}</p>
            </div>
          ))}
          {wallets.length === 0 && <p className="text-xs text-text-muted">Nenhuma conta cadastrada.</p>}
        </div>
        <button onClick={() => {
           const nome = prompt('Nome da conta:');
           if(nome) { personalWalletsService.create({nome, saldo_inicial: 0}).then(onUpdate); }
        }} className="mt-4 text-xs text-info hover:underline flex items-center gap-1"><Plus size={14}/> Nova Conta</button>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2"><CreditCard size={18} className="text-warning"/> Cartões de Crédito</h3>
        <div className="space-y-2">
          {cards.map((c:any) => (
            <div key={c.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
              <div><p className="font-medium text-sm text-text-primary">{c.nome}</p><p className="text-[10px] text-text-muted uppercase">Vence dia {c.dia_vencimento}</p></div>
              <div className="text-right"><p className="font-semibold text-warning">{formatCurrency(c.fatura_atual)}</p><p className="text-[10px] text-text-muted">Fatura atual</p></div>
            </div>
          ))}
          {cards.length === 0 && <p className="text-xs text-text-muted">Nenhum cartão cadastrado.</p>}
        </div>
        <button onClick={() => {
           const nome = prompt('Nome do cartão:');
           if(nome) { personalCardsService.create({nome, dia_vencimento: 10, dia_fechamento: 3}).then(onUpdate); }
        }} className="mt-4 text-xs text-warning hover:underline flex items-center gap-1"><Plus size={14}/> Novo Cartão</button>
      </div>
    </div>
  );
}

function MetasTab({ goals, onUpdate }: any) {
  return (
    <div className="space-y-4 animate-fade-in">
      <button onClick={() => {
         const titulo = prompt('Título da meta:');
         const valor = prompt('Valor alvo (R$):');
         if(titulo && valor) { personalGoalsService.create({titulo, valor_meta: Number(valor)}).then(onUpdate); }
      }} className="btn-primary flex items-center gap-2"><Plus size={16}/> Nova Meta</button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((g:any) => {
          const perc = Math.min(100, Math.round((g.valor_atual / g.valor_meta) * 100));
          return (
            <div key={g.id} className="card p-5 flex flex-col relative overflow-hidden group">
              <button onClick={()=> { personalGoalsService.delete(g.id).then(onUpdate); }} className="absolute top-3 right-3 text-white/20 hover:text-danger hidden group-hover:block"><Trash2 size={16}/></button>
              <h4 className="font-semibold text-text-primary">{g.titulo}</h4>
              <p className="text-xs text-text-muted mt-1 mb-4">Meta: {formatCurrency(g.valor_meta)}</p>
              
              <div className="mt-auto">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-success font-medium">{formatCurrency(g.valor_atual)}</span>
                  <span className="text-text-muted">{perc}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-success transition-all" style={{width: `${perc}%`}}></div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                 <button onClick={()=>{
                   const val = prompt('Adicionar saldo (R$):');
                   if(val) personalGoalsService.update(g.id, {valor_atual: g.valor_atual + Number(val)}).then(onUpdate);
                 }} className="btn-secondary py-1.5 text-xs flex-1">Guardar</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PersonalFinancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'lancamentos' | 'contas' | 'metas' | 'categorias'>('overview');
  
  const [accounts, setAccounts] = useState<PersonalAccount[]>([]);
  const [wallets, setWallets] = useState<PersonalWallet[]>([]);
  const [cards, setCards] = useState<PersonalCard[]>([]);
  const [categories, setCategories] = useState<PersonalCategory[]>([]);
  const [goals, setGoals] = useState<PersonalGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [accRes, walRes, cardRes, catRes, goalRes] = await Promise.all([
        personalAccountsService.list(),
        personalWalletsService.list(),
        personalCardsService.list(),
        personalCategoriesService.list(),
        personalGoalsService.list(),
      ]);
      setAccounts(accRes.data.items);
      setWallets(walRes.data.items);
      setCards(cardRes.data.items);
      setCategories(catRes.data.items);
      setGoals(goalRes.data.items);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: PieChart },
    { id: 'lancamentos', label: 'Lançamentos', icon: ArrowUpCircle },
    { id: 'contas', label: 'Contas & Cartões', icon: Wallet },
    { id: 'metas', label: 'Metas', icon: Target },
  ] as const;

  if(loading) return <div className="flex h-full items-center justify-center"><Loader2 size={32} className="animate-spin text-success" /></div>;

  return (
    <div className="animate-fade-in pb-12 max-w-7xl mx-auto">
      <div className="page-header mb-8">
        <h1 className="page-title flex items-center gap-2">
          <Wallet size={24} className="text-success" /> Financeiro Pessoal
        </h1>
        <p className="page-subtitle">Controle suas finanças, cartões de crédito e metas</p>
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

      {activeTab === 'overview' && <OverviewTab accounts={accounts} wallets={wallets} cards={cards} />}
      {activeTab === 'lancamentos' && <TransactionsTab accounts={accounts} wallets={wallets} cards={cards} categories={categories} onUpdate={loadData} />}
      {activeTab === 'contas' && <ContasTab wallets={wallets} cards={cards} onUpdate={loadData} />}
      {activeTab === 'metas' && <MetasTab goals={goals} onUpdate={loadData} />}
    </div>
  );
}

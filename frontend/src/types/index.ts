export type TaskStatus = 'pendente' | 'concluido';
export type TaskPriority = 'baixa' | 'media' | 'alta';

export interface Task {
  id: number;
  user_id: number;
  profile_id: number | null;
  titulo: string;
  descricao: string | null;
  prioridade: TaskPriority;
  status: TaskStatus;
  data_referencia: string; // YYYY-MM-DD
  ordem: number;
  importado_dia_anterior: boolean;
  concluido_em: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface TaskSummary {
  pendentes: number;
  concluidas: number;
  date: string;
}

export type NoteCategory = 'empresa' | 'pessoal' | 'financeiro' | 'senhas' | 'textos' | 'outros';

export interface Note {
  id: number;
  user_id: number;
  titulo: string | null;
  conteudo: string;
  categoria: NoteCategory;
  fixado: boolean;
  arquivado: boolean;
  cor_index: number;
  criado_em: string;
  atualizado_em: string;
}

export interface DashboardData {
  tasks: {
    pendentes: number;
    concluidas: number;
    date: string;
  };
  notes: {
    total: number;
    recentes: Note[];
  };
  finance: {
    receitas_mes: number;
    despesas_mes: number;
    saldo_mes: number;
    contas_pendentes: number;
    mes: string;
  };
}

export type AccountsPayableStatus = 'pendente' | 'lancado';

export interface AccountPayable {
  id: number;
  user_id: number;
  loja: string;
  competencia: string; // YYYY-MM
  descricao: string;
  valor: number | string;
  vencimento: string; // YYYY-MM-DD
  status: AccountsPayableStatus;
  observacao: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface AccountsPayableSummary {
  total_pendente: number;
  total_lancado: number;
  total_geral: number;
  vencidos: number;
}

export interface AccountsPayableDashboardSummary {
  total_pendente: number;
  total_geral: number;
  vencidos: number;
  vencendo_7_dias: AccountPayable[];
  competencia: string;
}

export interface XmlItem {
  id: number;
  xml_id: number;
  numero_item: number;
  descricao: string;
  codigo_produto: string | null;
  codigo_barras: string | null;
  cfop: string | null;
  ncm: string | null;
  quantidade: number | string | null;
  unidade: string | null;
  valor_unitario: number | string | null;
  valor_total: number | string | null;
  // Tributos
  origem: string | null;
  cst_icms: string | null;
  cst_pis: string | null;
  cst_cofins: string | null;
  cst_ipi: string | null;
  valor_icms: number | string | null;
  valor_pis: number | string | null;
  valor_cofins: number | string | null;
  valor_ipi: number | string | null;
}

export interface XmlFile {
  id: number;
  user_id: number;
  nome_arquivo: string;
  numero_nf: string | null;
  chave_acesso: string | null;
  fornecedor: string | null;
  cnpj_emitente: string | null;
  data_emissao: string | null;
  valor_total: number | string | null;
  processado_ia: boolean;
  metadata: any;
  criado_em: string;
  xml_original?: string;
  items_count?: number;
}

export interface NfClient {
  id: number;
  user_id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  cnpj_cpf: string | null;
  ativo: boolean;
  criado_em: string;
}

export interface EmailTemplate {
  id: number;
  user_id: number;
  nome: string;
  assunto: string;
  corpo: string;
  padrao: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface EmailHistory {
  id: number;
  user_id: number;
  client_id: number | null;
  cliente: string;
  email_destino: string;
  assunto: string;
  corpo: string | null;
  anexos: string | null;
  status: 'enviado' | 'erro' | 'pendente';
  erro_detalhe: string | null;
  numero_nf_produto: string | null;
  numero_nf_servico: string | null;
  data_envio: string;
}

export interface Settings {
  id: number;
  user_id: number;
  tema: 'dark' | 'light';
  sidebar_collapsed: boolean;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_email: string | null;
  has_smtp_senha?: boolean;
  smtp_nome_remetente: string | null;
  smtp_ssl: boolean;
  whatsapp_modo: 'web' | 'api';
  has_whatsapp_token?: boolean;
  backup_automatico: boolean;
  backup_frequencia: string | null;
  has_google_token?: boolean;
  has_onedrive_token?: boolean;
  has_ai_token?: boolean;
}

export interface WhatsappTemplate {
  id: number;
  user_id: number;
  nome: string;
  mensagem: string;
  padrao: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface WhatsappHistory {
  id: number;
  user_id: number;
  email_history_id: number | null;
  telefone: string;
  cliente: string | null;
  mensagem: string;
  modo: 'web' | 'api';
  status: 'aberto' | 'enviado' | 'erro';
  anexos: string | null;
  data_envio: string;
}

export interface PersonalCategory {
  id: number;
  user_id: number;
  nome: string;
  tipo: 'receita' | 'despesa' | 'ambos';
  icone: string | null;
  cor: string | null;
  ativo: boolean;
  criado_em: string;
}

export interface PersonalWallet {
  id: number;
  user_id: number;
  nome: string;
  tipo: 'conta_corrente' | 'poupanca' | 'carteira' | 'cartao_credito' | 'investimento';
  saldo_inicial: number;
  saldo_atual?: number; // Calculated on backend
  ativo: boolean;
  criado_em: string;
}

export interface PersonalCard {
  id: number;
  user_id: number;
  nome: string;
  limite: number | null;
  dia_vencimento: number;
  dia_fechamento: number;
  fatura_atual?: number; // Calculated on backend
  ativo: boolean;
  criado_em: string;
}

export interface PersonalAccount {
  id: number;
  user_id: number;
  category_id: number | null;
  wallet_id: number | null;
  card_id: number | null;
  descricao: string;
  valor: number;
  data_movimento: string;
  data_vencimento: string | null;
  tipo: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido' | 'cancelado';
  recorrente: boolean;
  recorrencia: string | null;
  parcela_atual: number | null;
  total_parcelas: number | null;
  observacao: string | null;
  criado_em: string;
}

export interface PersonalGoal {
  id: number;
  user_id: number;
  titulo: string;
  descricao: string | null;
  valor_meta: number;
  valor_atual: number;
  prazo: string | null;
  status: 'ativo' | 'concluido' | 'cancelado';
  icone: string | null;
  cor: string | null;
  criado_em: string;
}

export interface ActivityLog {
  id: number;
  user_id: number | null;
  user_nome?: string;
  user_email?: string;
  modulo: string;
  acao: string;
  descricao: string | null;
  detalhes: any | null;
  ip: string | null;
  user_agent: string | null;
  nivel: 'info' | 'warning' | 'error';
  data_hora: string;
}



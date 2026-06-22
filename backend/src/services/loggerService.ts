import db from '../config/database';

export interface LogEntry {
  user_id?: number | null;
  modulo: string;
  acao: string;
  descricao?: string;
  detalhes?: any;
  ip?: string;
  user_agent?: string;
  nivel?: 'info' | 'warning' | 'error';
}

export class LoggerService {
  /**
   * Registra uma atividade no banco de dados.
   * Não lança erro para não interromper fluxos se falhar (fire-and-forget seguro).
   */
  static async log(data: LogEntry) {
    try {
      await db('activity_logs').insert({
        user_id: data.user_id || null,
        modulo: data.modulo,
        acao: data.acao,
        descricao: data.descricao || null,
        detalhes: data.detalhes ? JSON.stringify(data.detalhes) : null,
        ip: data.ip || null,
        user_agent: data.user_agent || null,
        nivel: data.nivel || 'info',
      });
    } catch (err) {
      console.error('Falha ao gravar activity_log:', err);
    }
  }
}

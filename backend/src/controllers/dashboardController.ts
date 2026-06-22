import { Response, NextFunction } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middleware/authenticate';

export class DashboardController {
  // GET /api/dashboard — dados consolidados para o dashboard
  summary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const today = new Date().toISOString().split('T')[0];

      // Tasks summary
      const [tasksPending] = await db('tasks')
        .where({ user_id: userId, status: 'pendente', data_referencia: today })
        .count('id as total');

      const [tasksDone] = await db('tasks')
        .where({ user_id: userId, status: 'concluido', data_referencia: today })
        .count('id as total');

      // Notes summary
      const recentNotes = await db('sticky_notes')
        .where({ user_id: userId, arquivado: false })
        .orderBy('atualizado_em', 'desc')
        .limit(3)
        .select('id', 'titulo', 'conteudo', 'categoria', 'cor_index', 'fixado', 'atualizado_em');

      const [notesTotal] = await db('sticky_notes')
        .where({ user_id: userId, arquivado: false })
        .count('id as total');

      // Personal finance summary (perfil pessoal)
      const currentMonth = today.substring(0, 7); // YYYY-MM
      const [income] = await db('personal_accounts')
        .where({ user_id: userId, tipo: 'receita', status: 'pago' })
        .whereRaw("DATE_TRUNC('month', data_movimento) = DATE_TRUNC('month', CURRENT_DATE)")
        .sum('valor as total');

      const [expense] = await db('personal_accounts')
        .where({ user_id: userId, tipo: 'despesa', status: 'pago' })
        .whereRaw("DATE_TRUNC('month', data_movimento) = DATE_TRUNC('month', CURRENT_DATE)")
        .sum('valor as total');

      const [pendingPayable] = await db('personal_accounts')
        .where({ user_id: userId, tipo: 'despesa', status: 'pendente' })
        .whereRaw("data_vencimento >= CURRENT_DATE")
        .count('id as total');

      return res.json({
        tasks: {
          pendentes: Number(tasksPending.total),
          concluidas: Number(tasksDone.total),
          date: today,
        },
        notes: {
          total: Number(notesTotal.total),
          recentes: recentNotes,
        },
        finance: {
          receitas_mes: Number(income?.total ?? 0),
          despesas_mes: Number(expense?.total ?? 0),
          saldo_mes: Number(income?.total ?? 0) - Number(expense?.total ?? 0),
          contas_pendentes: Number(pendingPayable.total),
          mes: currentMonth,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}

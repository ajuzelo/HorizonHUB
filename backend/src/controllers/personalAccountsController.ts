import { Response, NextFunction } from 'express';
import db from '../config/database';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authenticate';

const accountSchema = z.object({
  category_id: z.number().nullable().optional(),
  wallet_id: z.number().nullable().optional(),
  card_id: z.number().nullable().optional(),
  descricao: z.string().min(1).max(500),
  valor: z.number().min(0.01),
  data_movimento: z.string(),
  data_vencimento: z.string().nullable().optional(),
  tipo: z.enum(['receita', 'despesa']),
  status: z.enum(['pendente', 'pago', 'recebido', 'cancelado']).default('pendente'),
  recorrente: z.boolean().optional().default(false),
  recorrencia: z.string().nullable().optional(),
  parcela_atual: z.number().nullable().optional(),
  total_parcelas: z.number().nullable().optional(),
  observacao: z.string().nullable().optional(),
});

export class PersonalAccountsController {
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { mes, ano, tipo } = req.query;

      let query = db('personal_accounts')
        .where({ user_id: userId })
        .orderBy('data_movimento', 'desc')
        .orderBy('id', 'desc');

      if (mes && ano) {
        query = query.whereRaw('EXTRACT(MONTH FROM data_movimento) = ?', [Number(mes)])
                     .whereRaw('EXTRACT(YEAR FROM data_movimento) = ?', [Number(ano)]);
      }

      if (tipo) {
        query = query.where({ tipo });
      }

      const items = await query;
      return res.json({ items });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const data = accountSchema.parse(req.body);

      // Status mapping shortcut: if user submits "pago" on an income, we convert to "recebido" to keep semantics correct.
      let status = data.status;
      if (data.tipo === 'receita' && status === 'pago') status = 'recebido';
      if (data.tipo === 'despesa' && status === 'recebido') status = 'pago';

      const [item] = await db('personal_accounts')
        .insert({ user_id: userId, ...data, status })
        .returning('*');

      return res.status(201).json({ item });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const data = accountSchema.parse(req.body);

      let status = data.status;
      if (data.tipo === 'receita' && status === 'pago') status = 'recebido';
      if (data.tipo === 'despesa' && status === 'recebido') status = 'pago';

      const [item] = await db('personal_accounts')
        .where({ id, user_id: userId })
        .update({ ...data, status, atualizado_em: db.fn.now() })
        .returning('*');

      if (!item) return res.status(404).json({ message: 'Lançamento não encontrado.' });
      return res.json({ item });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const deleted = await db('personal_accounts').where({ id, user_id: userId }).delete();
      if (!deleted) return res.status(404).json({ message: 'Lançamento não encontrado.' });

      return res.json({ message: 'Lançamento removido.' });
    } catch (err) {
      next(err);
    }
  };

  toggleStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      
      const item = await db('personal_accounts').where({ id, user_id: userId }).first();
      if (!item) return res.status(404).json({ message: 'Lançamento não encontrado.' });

      let newStatus = 'pendente';
      if (item.status === 'pendente') {
        newStatus = item.tipo === 'receita' ? 'recebido' : 'pago';
      }

      const [updated] = await db('personal_accounts')
        .where({ id, user_id: userId })
        .update({ status: newStatus, atualizado_em: db.fn.now() })
        .returning('*');

      return res.json({ item: updated });
    } catch (err) {
      next(err);
    }
  };
}

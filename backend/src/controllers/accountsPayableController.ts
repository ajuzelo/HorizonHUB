import { Response, NextFunction } from 'express';
import db from '../config/database';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authenticate';

// Competencia: YYYY-MM
const currentCompetencia = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const createSchema = z.object({
  loja: z.string().min(1).max(120),
  competencia: z.string().regex(/^\d{4}-\d{2}$/, 'Formato: YYYY-MM'),
  descricao: z.string().min(1).max(500),
  valor: z.number().positive(),
  vencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  observacao: z.string().optional(),
});

const updateSchema = createSchema.partial().extend({
  status: z.enum(['pendente', 'lancado']).optional(),
});

const filterSchema = z.object({
  competencia: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  status: z.string().optional(),
  loja: z.string().optional(),
  search: z.string().optional(),
});

export class AccountsPayableController {
  // GET /api/accounts-payable?competencia=YYYY-MM&status=...&loja=...&search=...
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const filter = filterSchema.parse(req.query);
      const competencia = filter.competencia ?? currentCompetencia();

      let query = db('accounts_payable')
        .where({ user_id: userId, competencia })
        .orderBy('vencimento', 'asc')
        .orderBy('criado_em', 'desc');

      if (filter.status) query = query.where({ status: filter.status });
      if (filter.loja) query = query.where({ loja: filter.loja });
      if (filter.search) {
        const term = `%${filter.search}%`;
        query = query.where((q) => q.whereILike('descricao', term).orWhereILike('loja', term));
      }

      const items = await query.select('*');

      // Summary totals for the period
      const all = await db('accounts_payable')
        .where({ user_id: userId, competencia })
        .select('valor', 'status', 'vencimento');

      const today = new Date().toISOString().split('T')[0];
      const summary = {
        total_pendente: all
          .filter((i: any) => i.status === 'pendente')
          .reduce((acc: number, i: any) => acc + Number(i.valor), 0),
        total_lancado: all
          .filter((i: any) => i.status === 'lancado')
          .reduce((acc: number, i: any) => acc + Number(i.valor), 0),
        total_geral: all.reduce((acc: number, i: any) => acc + Number(i.valor), 0),
        vencidos: all.filter((i: any) => i.status === 'pendente' && i.vencimento < today).length,
      };

      // Available months for switcher
      const months = await db('accounts_payable')
        .where({ user_id: userId })
        .distinct('competencia')
        .orderBy('competencia', 'desc')
        .pluck('competencia');

      return res.json({ items, summary, competencia, months });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/accounts-payable/dashboard — resumo para o dashboard
  dashboardSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const competencia = currentCompetencia();
      const today = new Date().toISOString().split('T')[0];

      const items = await db('accounts_payable')
        .where({ user_id: userId, competencia })
        .select('valor', 'status', 'vencimento');

      const vencendo7dias = await db('accounts_payable')
        .where({ user_id: userId, status: 'pendente' })
        .whereBetween('vencimento', [today, new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]])
        .orderBy('vencimento', 'asc')
        .limit(5)
        .select('id', 'loja', 'descricao', 'valor', 'vencimento');

      return res.json({
        total_pendente: items
          .filter((i: any) => i.status === 'pendente')
          .reduce((acc: number, i: any) => acc + Number(i.valor), 0),
        total_geral: items.reduce((acc: number, i: any) => acc + Number(i.valor), 0),
        vencidos: items.filter((i: any) => i.status === 'pendente' && i.vencimento < today).length,
        vencendo_7_dias: vencendo7dias,
        competencia,
      });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/accounts-payable/lojas — lista de lojas cadastradas (para autocomplete)
  getLojas = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const lojas = await db('accounts_payable')
        .where({ user_id: userId })
        .distinct('loja')
        .orderBy('loja', 'asc')
        .pluck('loja');
      return res.json({ lojas });
    } catch (err) {
      next(err);
    }
  };

  // POST /api/accounts-payable
  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const body = createSchema.parse(req.body);

      const [item] = await db('accounts_payable')
        .insert({ user_id: userId, ...body, status: 'pendente' })
        .returning('*');

      return res.status(201).json({ item });
    } catch (err) {
      next(err);
    }
  };

  // PUT /api/accounts-payable/:id
  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const body = updateSchema.parse(req.body);

      const existing = await db('accounts_payable').where({ id, user_id: userId }).first();
      if (!existing) return res.status(404).json({ message: 'Conta não encontrada.' });

      const [item] = await db('accounts_payable')
        .where({ id, user_id: userId })
        .update({ ...body, atualizado_em: db.fn.now() })
        .returning('*');

      return res.json({ item });
    } catch (err) {
      next(err);
    }
  };

  // PATCH /api/accounts-payable/:id/toggle — toggle pendente/lancado
  toggle = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const existing = await db('accounts_payable').where({ id, user_id: userId }).first();
      if (!existing) return res.status(404).json({ message: 'Conta não encontrada.' });

      const newStatus = existing.status === 'lancado' ? 'pendente' : 'lancado';
      const [item] = await db('accounts_payable')
        .where({ id, user_id: userId })
        .update({ status: newStatus, atualizado_em: db.fn.now() })
        .returning('*');

      return res.json({ item });
    } catch (err) {
      next(err);
    }
  };

  // DELETE /api/accounts-payable/:id
  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const deleted = await db('accounts_payable').where({ id, user_id: userId }).delete();
      if (!deleted) return res.status(404).json({ message: 'Conta não encontrada.' });

      return res.json({ message: 'Conta excluída.' });
    } catch (err) {
      next(err);
    }
  };
}

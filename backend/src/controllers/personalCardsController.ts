import { Response, NextFunction } from 'express';
import db from '../config/database';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authenticate';

const cardSchema = z.object({
  nome: z.string().min(1).max(120),
  limite: z.number().nullable().optional(),
  dia_vencimento: z.number().min(1).max(31).default(1),
  dia_fechamento: z.number().min(1).max(31).default(25),
  ativo: z.boolean().optional().default(true),
});

export class PersonalCardsController {
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      
      // Calculate current invoice amount (simplified: sum of pending/unpaid expenses attached to this card)
      // For a more exact view we would filter by billing cycle dates, but this is a good overview.
      const items = await db('personal_cards as c')
        .select('c.*')
        .select(
          db.raw(`
            COALESCE((
              SELECT SUM(valor)
              FROM personal_accounts a
              WHERE a.card_id = c.id AND a.status = 'pendente' AND a.tipo = 'despesa' AND a.user_id = c.user_id
            ), 0) as fatura_atual
          `)
        )
        .where({ 'c.user_id': userId })
        .orderBy('c.nome', 'asc');

      const mapped = items.map(i => ({ ...i, fatura_atual: Number(i.fatura_atual) }));

      return res.json({ items: mapped });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const data = cardSchema.parse(req.body);

      const [item] = await db('personal_cards')
        .insert({ user_id: userId, ...data })
        .returning('*');

      return res.status(201).json({ item: { ...item, fatura_atual: 0 } });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const data = cardSchema.parse(req.body);

      const [item] = await db('personal_cards')
        .where({ id, user_id: userId })
        .update(data)
        .returning('*');

      if (!item) return res.status(404).json({ message: 'Cartão não encontrado.' });
      return res.json({ item });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const deleted = await db('personal_cards').where({ id, user_id: userId }).delete();
      if (!deleted) return res.status(404).json({ message: 'Cartão não encontrado.' });

      return res.json({ message: 'Cartão removido.' });
    } catch (err) {
      next(err);
    }
  };
}

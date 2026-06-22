import { Response, NextFunction } from 'express';
import db from '../config/database';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authenticate';

const goalSchema = z.object({
  titulo: z.string().min(1).max(255),
  descricao: z.string().nullable().optional(),
  valor_meta: z.number().min(0.01),
  valor_atual: z.number().default(0),
  prazo: z.string().nullable().optional(),
  status: z.enum(['ativo', 'concluido', 'cancelado']).default('ativo'),
  icone: z.string().max(50).nullable().optional(),
  cor: z.string().max(7).nullable().optional(),
});

export class PersonalGoalsController {
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const items = await db('personal_goals')
        .where({ user_id: userId })
        .orderBy('status', 'asc')
        .orderBy('criado_em', 'desc');
      return res.json({ items });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const data = goalSchema.parse(req.body);

      const [item] = await db('personal_goals')
        .insert({ user_id: userId, ...data })
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
      const data = goalSchema.parse(req.body);

      const [item] = await db('personal_goals')
        .where({ id, user_id: userId })
        .update({ ...data, atualizado_em: db.fn.now() })
        .returning('*');

      if (!item) return res.status(404).json({ message: 'Meta não encontrada.' });
      return res.json({ item });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const deleted = await db('personal_goals').where({ id, user_id: userId }).delete();
      if (!deleted) return res.status(404).json({ message: 'Meta não encontrada.' });

      return res.json({ message: 'Meta removida.' });
    } catch (err) {
      next(err);
    }
  };
}

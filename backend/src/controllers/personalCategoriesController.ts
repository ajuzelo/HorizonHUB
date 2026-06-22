import { Response, NextFunction } from 'express';
import db from '../config/database';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authenticate';

const categorySchema = z.object({
  nome: z.string().min(1).max(120),
  tipo: z.enum(['receita', 'despesa', 'ambos']),
  icone: z.string().max(50).nullable().optional(),
  cor: z.string().max(7).nullable().optional(),
  ativo: z.boolean().optional().default(true),
});

export class PersonalCategoriesController {
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const items = await db('personal_categories')
        .where({ user_id: userId })
        .orderBy('nome', 'asc');
      return res.json({ items });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const data = categorySchema.parse(req.body);

      const [item] = await db('personal_categories')
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
      const data = categorySchema.parse(req.body);

      const [item] = await db('personal_categories')
        .where({ id, user_id: userId })
        .update(data)
        .returning('*');

      if (!item) return res.status(404).json({ message: 'Categoria não encontrada.' });
      return res.json({ item });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const deleted = await db('personal_categories').where({ id, user_id: userId }).delete();
      if (!deleted) return res.status(404).json({ message: 'Categoria não encontrada.' });

      return res.json({ message: 'Categoria removida.' });
    } catch (err) {
      next(err);
    }
  };
}

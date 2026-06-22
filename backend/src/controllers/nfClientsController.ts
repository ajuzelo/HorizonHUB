import { Response, NextFunction } from 'express';
import db from '../config/database';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authenticate';

const clientSchema = z.object({
  nome: z.string().min(1).max(255),
  email: z.string().email().nullable().optional().or(z.literal('')),
  telefone: z.string().max(20).nullable().optional(),
  cnpj_cpf: z.string().max(20).nullable().optional(),
  ativo: z.boolean().optional().default(true),
});

export class NfClientsController {
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { search } = req.query;

      let query = db('nf_clients').where({ user_id: userId }).orderBy('nome', 'asc');

      if (search) {
        query = query.whereILike('nome', `%${search}%`)
                     .orWhereILike('email', `%${search}%`)
                     .orWhereILike('cnpj_cpf', `%${search}%`);
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
      const data = clientSchema.parse(req.body);

      const [item] = await db('nf_clients')
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
      const data = clientSchema.parse(req.body);

      const [item] = await db('nf_clients')
        .where({ id, user_id: userId })
        .update({ ...data })
        .returning('*');

      if (!item) return res.status(404).json({ message: 'Cliente não encontrado.' });
      return res.json({ item });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const deleted = await db('nf_clients').where({ id, user_id: userId }).delete();
      if (!deleted) return res.status(404).json({ message: 'Cliente não encontrado.' });

      return res.json({ message: 'Cliente removido.' });
    } catch (err) {
      next(err);
    }
  };
}

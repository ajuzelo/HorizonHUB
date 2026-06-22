import { Response, NextFunction } from 'express';
import db from '../config/database';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authenticate';

const templateSchema = z.object({
  nome: z.string().min(1).max(120),
  mensagem: z.string().min(1),
  padrao: z.boolean().optional().default(false),
});

export class WhatsappTemplatesController {
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const items = await db('whatsapp_templates').where({ user_id: userId }).orderBy('nome', 'asc');
      return res.json({ items });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const data = templateSchema.parse(req.body);

      if (data.padrao) {
        await db('whatsapp_templates').where({ user_id: userId }).update({ padrao: false });
      }

      const [item] = await db('whatsapp_templates')
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
      const data = templateSchema.parse(req.body);

      if (data.padrao) {
        await db('whatsapp_templates').where({ user_id: userId }).update({ padrao: false });
      }

      const [item] = await db('whatsapp_templates')
        .where({ id, user_id: userId })
        .update({ ...data, atualizado_em: db.fn.now() })
        .returning('*');

      if (!item) return res.status(404).json({ message: 'Modelo não encontrado.' });
      return res.json({ item });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const deleted = await db('whatsapp_templates').where({ id, user_id: userId }).delete();
      if (!deleted) return res.status(404).json({ message: 'Modelo não encontrado.' });

      return res.json({ message: 'Modelo removido.' });
    } catch (err) {
      next(err);
    }
  };
}

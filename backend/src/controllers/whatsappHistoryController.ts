import { Response, NextFunction } from 'express';
import db from '../config/database';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authenticate';

export class WhatsappHistoryController {
  listHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { search } = req.query;

      let query = db('whatsapp_history').where({ user_id: userId }).orderBy('data_envio', 'desc');

      if (search) {
        query = query.whereILike('cliente', `%${search}%`)
                     .orWhereILike('telefone', `%${search}%`)
                     .orWhereILike('mensagem', `%${search}%`);
      }

      const items = await query.limit(100);
      return res.json({ items });
    } catch (err) {
      next(err);
    }
  };

  logSend = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      
      const schema = z.object({
        telefone: z.string().min(1),
        cliente: z.string().optional(),
        mensagem: z.string().min(1),
        modo: z.enum(['web', 'api']).default('web'),
        status: z.enum(['aberto', 'enviado', 'erro']).default('aberto'),
      });

      const data = schema.parse(req.body);

      const [history] = await db('whatsapp_history').insert({
        user_id: userId,
        telefone: data.telefone,
        cliente: data.cliente || null,
        mensagem: data.mensagem,
        modo: data.modo,
        status: data.status,
      }).returning('*');

      return res.json({ message: 'Envio registrado com sucesso!', history });
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const { status } = z.object({ status: z.enum(['aberto', 'enviado', 'erro']) }).parse(req.body);

      const [history] = await db('whatsapp_history')
        .where({ id, user_id: userId })
        .update({ status })
        .returning('*');

      return res.json({ history });
    } catch (err) {
      next(err);
    }
  };
}

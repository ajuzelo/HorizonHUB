import { Response, NextFunction } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middleware/authenticate';

export class LogsController {
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { modulo, nivel, limit = 100 } = req.query;

      let query = db('activity_logs as l')
        .leftJoin('users as u', 'l.user_id', 'u.id')
        .select('l.*', 'u.nome as user_nome', 'u.email as user_email')
        .orderBy('l.data_hora', 'desc')
        .limit(Number(limit));

      if (modulo) {
        query = query.where('l.modulo', String(modulo));
      }
      if (nivel) {
        query = query.where('l.nivel', String(nivel));
      }

      const items = await query;
      return res.json({ items });
    } catch (err) {
      next(err);
    }
  };
}

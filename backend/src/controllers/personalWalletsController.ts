import { Response, NextFunction } from 'express';
import db from '../config/database';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authenticate';

const walletSchema = z.object({
  nome: z.string().min(1).max(120),
  tipo: z.enum(['conta_corrente', 'poupanca', 'carteira', 'cartao_credito', 'investimento']).default('conta_corrente'),
  saldo_inicial: z.number().default(0),
  ativo: z.boolean().optional().default(true),
});

export class PersonalWalletsController {
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      // Obter as carteiras com o saldo atual calculado
      const items = await db('personal_wallets as w')
        .select('w.*')
        .select(
          db.raw(`
            COALESCE((
              SELECT SUM(
                CASE WHEN a.tipo = 'receita' THEN a.valor ELSE -a.valor END
              )
              FROM personal_accounts a
              WHERE a.wallet_id = w.id AND a.status = 'pago' AND a.user_id = w.user_id
            ), 0) + w.saldo_inicial as saldo_atual
          `)
        )
        .where({ 'w.user_id': userId })
        .orderBy('w.nome', 'asc');
        
      // Ensure saldo_atual is parsed as number
      const mapped = items.map(i => ({ ...i, saldo_atual: Number(i.saldo_atual) }));

      return res.json({ items: mapped });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const data = walletSchema.parse(req.body);

      const [item] = await db('personal_wallets')
        .insert({ user_id: userId, ...data })
        .returning('*');

      return res.status(201).json({ item: { ...item, saldo_atual: item.saldo_inicial } });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const data = walletSchema.parse(req.body);

      const [item] = await db('personal_wallets')
        .where({ id, user_id: userId })
        .update(data)
        .returning('*');

      if (!item) return res.status(404).json({ message: 'Carteira não encontrada.' });
      return res.json({ item });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const deleted = await db('personal_wallets').where({ id, user_id: userId }).delete();
      if (!deleted) return res.status(404).json({ message: 'Carteira não encontrada.' });

      return res.json({ message: 'Carteira removida.' });
    } catch (err) {
      next(err);
    }
  };
}

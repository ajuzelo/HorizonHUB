import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database';
import { z } from 'zod';

const initSchema = z.object({
  nome: z.string().min(2).max(120),
  email: z.string().email(),
  senha: z.string().min(6),
});

export class SetupController {
  /**
   * GET /api/setup/status
   * Returns whether the system has been initialized (has any user)
   */
  getStatus = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const userCount = await db('users').count('id as total').first();
      const total = Number(userCount?.total ?? 0);

      return res.json({
        initialized: total > 0,
        version: '1.0.0',
        app: 'Horizon HUB',
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/setup/initialize
   * Creates the first admin user and initial data
   * Only works if no users exist yet
   */
  initialize = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Guard: only allowed if system is not yet initialized
      const userCount = await db('users').count('id as total').first();
      if (Number(userCount?.total ?? 0) > 0) {
        return res.status(409).json({
          message: 'Sistema já foi inicializado. Faça login normalmente.',
        });
      }

      const body = initSchema.parse(req.body);

      // Hash password
      const senha_hash = await bcrypt.hash(body.senha, 12);

      // Create admin user in a transaction
      const userId = await db.transaction(async (trx) => {
        // 1. Create user
        const [user] = await trx('users')
          .insert({
            nome: body.nome,
            email: body.email,
            senha_hash,
            ativo: true,
            role: 'admin',
            setup_concluido: true,
            locale: 'pt-BR',
            timezone: 'America/Sao_Paulo',
          })
          .returning('id');

        const uid = user.id;

        // 2. Assign both profiles to user
        const profiles = await trx('profiles').select('id');
        await trx('user_profiles').insert(
          profiles.map((p: { id: number }) => ({
            user_id: uid,
            profile_id: p.id,
            ativo: true,
          }))
        );

        // 3. Create default settings
        await trx('settings').insert({
          user_id: uid,
          tema: 'dark',
          sidebar_collapsed: false,
        });

        // 4. Create default personal finance categories
        const defaultCategories = [
          { nome: 'Salário', tipo: 'receita', icone: 'briefcase', cor: '#22c55e' },
          { nome: 'Freelance', tipo: 'receita', icone: 'laptop', cor: '#3b82f6' },
          { nome: 'Investimentos', tipo: 'receita', icone: 'trending-up', cor: '#8b5cf6' },
          { nome: 'Outros (Receita)', tipo: 'receita', icone: 'plus-circle', cor: '#06b6d4' },
          { nome: 'Moradia', tipo: 'despesa', icone: 'home', cor: '#f59e0b' },
          { nome: 'Alimentação', tipo: 'despesa', icone: 'utensils', cor: '#ef4444' },
          { nome: 'Transporte', tipo: 'despesa', icone: 'car', cor: '#f97316' },
          { nome: 'Saúde', tipo: 'despesa', icone: 'heart-pulse', cor: '#ec4899' },
          { nome: 'Educação', tipo: 'despesa', icone: 'graduation-cap', cor: '#6366f1' },
          { nome: 'Lazer', tipo: 'despesa', icone: 'gamepad-2', cor: '#14b8a6' },
          { nome: 'Vestuário', tipo: 'despesa', icone: 'shirt', cor: '#a855f7' },
          { nome: 'Outros (Despesa)', tipo: 'despesa', icone: 'minus-circle', cor: '#6b7280' },
        ];

        await trx('personal_categories').insert(
          defaultCategories.map((c) => ({ ...c, user_id: uid }))
        );

        // 5. Log initialization
        await trx('activity_logs').insert({
          user_id: uid,
          modulo: 'configuracoes',
          acao: 'setup_inicial',
          descricao: 'Sistema inicializado e usuário administrador criado.',
        });

        return uid;
      });

      return res.status(201).json({
        message: 'Sistema inicializado com sucesso!',
        user_id: userId,
      });
    } catch (err) {
      next(err);
    }
  };
}

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database';
import { env } from '../config/env';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export class AuthController {
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = loginSchema.parse(req.body);

      const user = await db('users')
        .where({ email: body.email, ativo: true })
        .first();

      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }

      const senhaOk = await bcrypt.compare(body.senha, user.senha_hash);
      if (!senhaOk) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }

      // Update last access
      await db('users').where({ id: user.id }).update({
        ultimo_acesso: db.fn.now(),
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
      );

      // Get user profiles
      const profiles = await db('user_profiles as up')
        .join('profiles as p', 'p.id', 'up.profile_id')
        .where('up.user_id', user.id)
        .where('up.ativo', true)
        .select('p.id', 'p.nome', 'p.descricao');

      // Log activity
      await db('activity_logs').insert({
        user_id: user.id,
        modulo: 'auth',
        acao: 'login',
        descricao: `Login realizado por ${user.nome}`,
        ip: req.ip,
        user_agent: req.get('user-agent'),
      });

      return res.json({
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role,
          setup_concluido: user.setup_concluido,
        },
        profiles,
      });
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      await db('activity_logs').insert({
        user_id: userId,
        modulo: 'auth',
        acao: 'logout',
        ip: req.ip,
      });
      return res.json({ message: 'Logout realizado.' });
    } catch (err) {
      next(err);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const user = await db('users')
        .where({ id: userId, ativo: true })
        .select('id', 'nome', 'email', 'role', 'setup_concluido', 'avatar_url', 'locale', 'timezone', 'data_criacao')
        .first();

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      const profiles = await db('user_profiles as up')
        .join('profiles as p', 'p.id', 'up.profile_id')
        .where('up.user_id', userId)
        .where('up.ativo', true)
        .select('p.id', 'p.nome', 'p.descricao');

      const settings = await db('settings').where({ user_id: userId }).first();

      return res.json({ user, profiles, settings });
    } catch (err) {
      next(err);
    }
  };

  setActiveProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const { profile_id } = req.body;

      const profileExists = await db('user_profiles')
        .where({ user_id: userId, profile_id, ativo: true })
        .first();

      if (!profileExists) {
        return res.status(404).json({ message: 'Perfil não encontrado.' });
      }

      return res.json({ active_profile_id: profile_id });
    } catch (err) {
      next(err);
    }
  };
}

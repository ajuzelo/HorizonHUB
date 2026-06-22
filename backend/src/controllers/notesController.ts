import { Request, Response, NextFunction } from 'express';
import db from '../config/database';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authenticate';

const createSchema = z.object({
  titulo: z.string().max(255).optional(),
  conteudo: z.string().min(1),
  categoria: z.enum(['empresa', 'pessoal', 'financeiro', 'senhas', 'textos', 'outros']).default('outros'),
  fixado: z.boolean().optional(),
  cor_index: z.number().min(0).max(7).optional(),
});

const updateSchema = createSchema.partial();

export class NotesController {
  // GET /api/notes?categoria=empresa&search=texto
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { categoria, search } = req.query;

      let query = db('sticky_notes')
        .where({ user_id: userId, arquivado: false })
        .orderBy('fixado', 'desc')
        .orderBy('atualizado_em', 'desc');

      if (categoria) query = query.where({ categoria: String(categoria) });

      if (search) {
        const term = `%${String(search)}%`;
        query = query.where((qb) =>
          qb.whereILike('titulo', term).orWhereILike('conteudo', term)
        );
      }

      const notes = await query.select('*');
      return res.json({ notes });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/notes/summary — para dashboard
  summary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;

      const notes = await db('sticky_notes')
        .where({ user_id: userId, arquivado: false })
        .orderBy('fixado', 'desc')
        .orderBy('atualizado_em', 'desc')
        .limit(3)
        .select('id', 'titulo', 'conteudo', 'categoria', 'cor_index', 'fixado', 'atualizado_em');

      const [{ total }] = await db('sticky_notes')
        .where({ user_id: userId, arquivado: false })
        .count('id as total');

      return res.json({ notes, total: Number(total) });
    } catch (err) {
      next(err);
    }
  };

  // POST /api/notes
  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const body = createSchema.parse(req.body);

      const [note] = await db('sticky_notes')
        .insert({
          user_id: userId,
          titulo: body.titulo ?? null,
          conteudo: body.conteudo,
          categoria: body.categoria,
          fixado: body.fixado ?? false,
          cor_index: body.cor_index ?? 0,
          arquivado: false,
        })
        .returning('*');

      return res.status(201).json({ note });
    } catch (err) {
      next(err);
    }
  };

  // PUT /api/notes/:id
  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const body = updateSchema.parse(req.body);

      const existing = await db('sticky_notes').where({ id, user_id: userId }).first();
      if (!existing) return res.status(404).json({ message: 'Nota não encontrada.' });

      const [note] = await db('sticky_notes')
        .where({ id, user_id: userId })
        .update({ ...body, atualizado_em: db.fn.now() })
        .returning('*');

      return res.json({ note });
    } catch (err) {
      next(err);
    }
  };

  // PATCH /api/notes/:id/pin — toggle fixado
  togglePin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const existing = await db('sticky_notes').where({ id, user_id: userId }).first();
      if (!existing) return res.status(404).json({ message: 'Nota não encontrada.' });

      const [note] = await db('sticky_notes')
        .where({ id, user_id: userId })
        .update({ fixado: !existing.fixado, atualizado_em: db.fn.now() })
        .returning('*');

      return res.json({ note });
    } catch (err) {
      next(err);
    }
  };

  // DELETE /api/notes/:id
  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const deleted = await db('sticky_notes').where({ id, user_id: userId }).delete();
      if (!deleted) return res.status(404).json({ message: 'Nota não encontrada.' });

      return res.json({ message: 'Nota excluída.' });
    } catch (err) {
      next(err);
    }
  };
}

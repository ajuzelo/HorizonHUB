import { Request, Response, NextFunction } from 'express';
import db from '../config/database';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authenticate';

const createSchema = z.object({
  titulo: z.string().min(1).max(500),
  descricao: z.string().optional(),
  prioridade: z.enum(['baixa', 'media', 'alta']).default('media'),
  data_referencia: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  profile_id: z.number().optional(),
  ordem: z.number().optional(),
});

const updateSchema = createSchema.partial().extend({
  status: z.enum(['pendente', 'concluido']).optional(),
  concluido_em: z.string().nullable().optional(),
});

export class TasksController {
  // GET /api/tasks?date=YYYY-MM-DD&status=pendente
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { date, status } = req.query;

      const referenceDate = date
        ? String(date)
        : new Date().toISOString().split('T')[0];

      let query = db('tasks')
        .where({ user_id: userId, data_referencia: referenceDate })
        .orderBy('ordem', 'asc')
        .orderBy('criado_em', 'asc');

      if (status) {
        query = query.where({ status: String(status) });
      }

      const tasks = await query.select('*');
      return res.json({ tasks, date: referenceDate });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/tasks/pending-yesterday — tarefas pendentes do dia anterior
  pendingYesterday = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const tasks = await db('tasks')
        .where({ user_id: userId, data_referencia: yesterdayStr, status: 'pendente' })
        .select('*');

      return res.json({ tasks, date: yesterdayStr, count: tasks.length });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/tasks/summary — resumo para o dashboard
  summary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const today = new Date().toISOString().split('T')[0];

      const [pending] = await db('tasks')
        .where({ user_id: userId, status: 'pendente', data_referencia: today })
        .count('id as total');

      const [completed] = await db('tasks')
        .where({ user_id: userId, status: 'concluido', data_referencia: today })
        .count('id as total');

      return res.json({
        pendentes: Number(pending.total),
        concluidas: Number(completed.total),
        date: today,
      });
    } catch (err) {
      next(err);
    }
  };

  // POST /api/tasks
  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const body = createSchema.parse(req.body);

      // Calculate next order for the date
      const [maxOrder] = await db('tasks')
        .where({ user_id: userId, data_referencia: body.data_referencia })
        .max('ordem as max');

      const [task] = await db('tasks')
        .insert({
          user_id: userId,
          titulo: body.titulo,
          descricao: body.descricao ?? null,
          prioridade: body.prioridade,
          status: 'pendente',
          data_referencia: body.data_referencia,
          profile_id: body.profile_id ?? null,
          ordem: body.ordem ?? (Number(maxOrder?.max ?? -1) + 1),
          importado_dia_anterior: false,
        })
        .returning('*');

      return res.status(201).json({ task });
    } catch (err) {
      next(err);
    }
  };

  // PUT /api/tasks/:id
  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const body = updateSchema.parse(req.body);

      const existing = await db('tasks').where({ id, user_id: userId }).first();
      if (!existing) return res.status(404).json({ message: 'Tarefa não encontrada.' });

      const updateData: any = { ...body, atualizado_em: db.fn.now() };

      if (body.status === 'concluido' && existing.status !== 'concluido') {
        updateData.concluido_em = db.fn.now();
      } else if (body.status === 'pendente') {
        updateData.concluido_em = null;
      }

      const [task] = await db('tasks')
        .where({ id, user_id: userId })
        .update(updateData)
        .returning('*');

      return res.json({ task });
    } catch (err) {
      next(err);
    }
  };

  // PATCH /api/tasks/:id/toggle — toggle status pendente/concluido
  toggle = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const existing = await db('tasks').where({ id, user_id: userId }).first();
      if (!existing) return res.status(404).json({ message: 'Tarefa não encontrada.' });

      const newStatus = existing.status === 'concluido' ? 'pendente' : 'concluido';
      const [task] = await db('tasks')
        .where({ id, user_id: userId })
        .update({
          status: newStatus,
          concluido_em: newStatus === 'concluido' ? db.fn.now() : null,
          atualizado_em: db.fn.now(),
        })
        .returning('*');

      return res.json({ task });
    } catch (err) {
      next(err);
    }
  };

  // POST /api/tasks/import-yesterday — importa pendentes do dia anterior
  importYesterday = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];

      const pending = await db('tasks')
        .where({ user_id: userId, data_referencia: yesterdayStr, status: 'pendente' })
        .select('*');

      if (pending.length === 0) {
        return res.json({ imported: 0, tasks: [] });
      }

      const [maxOrder] = await db('tasks')
        .where({ user_id: userId, data_referencia: today })
        .max('ordem as max');

      let orderBase = Number(maxOrder?.max ?? -1) + 1;

      const newTasks = await db('tasks')
        .insert(
          pending.map((t: any) => ({
            user_id: userId,
            titulo: t.titulo,
            descricao: t.descricao,
            prioridade: t.prioridade,
            status: 'pendente',
            data_referencia: today,
            profile_id: t.profile_id,
            ordem: orderBase++,
            importado_dia_anterior: true,
          }))
        )
        .returning('*');

      return res.json({ imported: newTasks.length, tasks: newTasks });
    } catch (err) {
      next(err);
    }
  };

  // DELETE /api/tasks/:id
  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const deleted = await db('tasks').where({ id, user_id: userId }).delete();
      if (!deleted) return res.status(404).json({ message: 'Tarefa não encontrada.' });

      return res.json({ message: 'Tarefa excluída.' });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/tasks/export/txt?date=YYYY-MM-DD
  exportTxt = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const date = req.query.date
        ? String(req.query.date)
        : new Date().toISOString().split('T')[0];

      const tasks = await db('tasks')
        .where({ user_id: userId, data_referencia: date })
        .orderBy('ordem', 'asc')
        .select('*');

      const formatDate = (d: string) =>
        new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');

      const lines = [
        `TAREFAS — ${formatDate(date)}`,
        '='.repeat(40),
        '',
        ...tasks.map((t: any, i: number) => {
          const check = t.status === 'concluido' ? '[✓]' : '[ ]';
          const prio = t.prioridade.toUpperCase();
          return `${check} ${i + 1}. [${prio}] ${t.titulo}${t.descricao ? `\n     ${t.descricao}` : ''}`;
        }),
        '',
        `Total: ${tasks.length} | Concluídas: ${tasks.filter((t: any) => t.status === 'concluido').length} | Pendentes: ${tasks.filter((t: any) => t.status === 'pendente').length}`,
      ];

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="tarefas-${date}.txt"`);
      return res.send(lines.join('\n'));
    } catch (err) {
      next(err);
    }
  };
}

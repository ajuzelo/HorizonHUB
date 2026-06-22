import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Dados inválidos.',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Database unique constraint violation (PostgreSQL error code 23505)
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as any).code === '23505'
  ) {
    return res.status(409).json({ message: 'Registro duplicado.' });
  }

  // Generic error
  console.error('[ERROR]', err);
  return res.status(500).json({
    message: 'Erro interno do servidor.',
    ...(process.env.NODE_ENV === 'development'
      ? { detail: String(err) }
      : {}),
  });
}

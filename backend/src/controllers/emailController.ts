import { Response, NextFunction } from 'express';
import db from '../config/database';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authenticate';
import nodemailer from 'nodemailer';
import { decrypt } from '../utils/crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for email attachments
const uploadDir = path.join(process.cwd(), 'uploads', 'email_attachments');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

export const attachmentUpload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max per attachment
});

export class EmailController {
  // GET /api/email/history
  listHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { search } = req.query;

      let query = db('email_history').where({ user_id: userId }).orderBy('data_envio', 'desc');

      if (search) {
        query = query.whereILike('cliente', `%${search}%`)
                     .orWhereILike('assunto', `%${search}%`)
                     .orWhereILike('email_destino', `%${search}%`);
      }

      const items = await query.limit(100);
      return res.json({ items });
    } catch (err) {
      next(err);
    }
  };

  // POST /api/email/send
  send = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[];
    try {
      const userId = req.userId!;
      
      const schema = z.object({
        client_id: z.string().optional(),
        cliente_nome: z.string().min(1),
        email_destino: z.string().email(),
        assunto: z.string().min(1),
        corpo: z.string().min(1),
        numero_nf_produto: z.string().optional(),
        numero_nf_servico: z.string().optional(),
      });

      const data = schema.parse(req.body);

      // Fetch user's SMTP settings
      const settings = await db('settings').where({ user_id: userId }).first();

      if (!settings || !settings.smtp_host || !settings.smtp_port || !settings.smtp_email || !settings.smtp_senha_encrypted) {
        return res.status(400).json({ message: 'Configurações SMTP não informadas ou incompletas.' });
      }

      const password = decrypt(settings.smtp_senha_encrypted);
      if (!password) {
        return res.status(400).json({ message: 'Falha ao descriptografar a senha do SMTP.' });
      }

      // Setup Nodemailer
      const transporter = nodemailer.createTransport({
        host: settings.smtp_host,
        port: settings.smtp_port,
        secure: settings.smtp_ssl,
        auth: {
          user: settings.smtp_email,
          pass: password,
        },
      });

      // Attachments preparation
      const attachments = files?.map(f => ({
        filename: f.originalname,
        path: f.path,
      })) || [];

      let status = 'enviado';
      let erro_detalhe = null;

      try {
        await transporter.sendMail({
          from: `"${settings.smtp_nome_remetente || 'Horizon HUB'}" <${settings.smtp_email}>`,
          to: data.email_destino,
          subject: data.assunto,
          html: data.corpo,
          attachments,
        });
      } catch (sendErr: any) {
        status = 'erro';
        erro_detalhe = sendErr.message || 'Erro desconhecido ao enviar email';
      } finally {
        // Clean up temp attachments
        files?.forEach(f => {
          try { fs.unlinkSync(f.path); } catch {}
        });
      }

      // Record History
      const [history] = await db('email_history').insert({
        user_id: userId,
        client_id: data.client_id ? Number(data.client_id) : null,
        cliente: data.cliente_nome,
        email_destino: data.email_destino,
        assunto: data.assunto,
        corpo: data.corpo,
        anexos: JSON.stringify(attachments.map(a => a.filename)),
        status,
        erro_detalhe,
        numero_nf_produto: data.numero_nf_produto || null,
        numero_nf_servico: data.numero_nf_servico || null,
      }).returning('*');

      if (status === 'erro') {
        return res.status(500).json({ message: 'Falha no envio do e-mail.', history });
      }

      return res.json({ message: 'E-mail enviado com sucesso!', history });
    } catch (err) {
      files?.forEach(f => { try { fs.unlinkSync(f.path); } catch {} });
      next(err);
    }
  };
}

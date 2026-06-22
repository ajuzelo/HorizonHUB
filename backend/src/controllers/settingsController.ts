import { Response, NextFunction } from 'express';
import db from '../config/database';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authenticate';
import { encrypt, decrypt } from '../utils/crypto';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs';
import { LoggerService } from '../services/loggerService';

const execAsync = util.promisify(exec);

const updateSmtpSchema = z.object({
  smtp_host: z.string().nullable().optional(),
  smtp_port: z.number().nullable().optional(),
  smtp_email: z.string().email().nullable().optional().or(z.literal('')),
  smtp_senha: z.string().nullable().optional(), // Will be encrypted
  smtp_nome_remetente: z.string().nullable().optional(),
  smtp_ssl: z.boolean().optional(),
});

export class SettingsController {
  // Obter configurações do usuário logado
  getSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      let settings = await db('settings').where({ user_id: userId }).first();

      if (!settings) {
        [settings] = await db('settings').insert({ user_id: userId }).returning('*');
      }

      // Hide passwords but indicate if they exist
      const response = {
        ...settings,
        smtp_senha_encrypted: undefined,
        has_smtp_senha: !!settings.smtp_senha_encrypted,
        whatsapp_api_token_encrypted: undefined,
        has_whatsapp_token: !!settings.whatsapp_api_token_encrypted,
        google_drive_token_encrypted: undefined,
        has_google_token: !!settings.google_drive_token_encrypted,
        onedrive_token_encrypted: undefined,
        has_onedrive_token: !!settings.onedrive_token_encrypted,
        ai_api_key_encrypted: undefined,
        has_ai_token: !!settings.ai_api_key_encrypted,
      };

      return res.json(response);
    } catch (err) {
      next(err);
    }
  };

  // Atualizar SMTP
  updateSmtp = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const data = updateSmtpSchema.parse(req.body);

      const updateData: any = {
        smtp_host: data.smtp_host || null,
        smtp_port: data.smtp_port || null,
        smtp_email: data.smtp_email || null,
        smtp_nome_remetente: data.smtp_nome_remetente || null,
        smtp_ssl: data.smtp_ssl ?? false,
        atualizado_em: db.fn.now(),
      };

      if (data.smtp_senha) {
        updateData.smtp_senha_encrypted = encrypt(data.smtp_senha);
      } else if (data.smtp_senha === '') {
         updateData.smtp_senha_encrypted = null;
      }

      await db('settings')
        .insert({ user_id: userId, ...updateData })
        .onConflict('user_id')
        .merge(updateData);

      const updated = await db('settings').where({ user_id: userId }).first();

      return res.json({ message: 'Configurações SMTP atualizadas.', settings: updated });
    } catch (err) {
      next(err);
    }
  };

  // Atualizar WhatsApp
  updateWhatsapp = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      
      const updateWhatsappSchema = z.object({
        whatsapp_modo: z.enum(['web', 'api']),
        whatsapp_api_token: z.string().optional(),
      });

      const data = updateWhatsappSchema.parse(req.body);

      const updateData: any = {
        whatsapp_modo: data.whatsapp_modo,
        atualizado_em: db.fn.now(),
      };

      if (data.whatsapp_api_token) {
        updateData.whatsapp_api_token_encrypted = encrypt(data.whatsapp_api_token);
      } else if (data.whatsapp_api_token === '') {
        updateData.whatsapp_api_token_encrypted = null;
      }

      await db('settings')
        .insert({ user_id: userId, ...updateData })
        .onConflict('user_id')
        .merge(updateData);

      const updated = await db('settings').where({ user_id: userId }).first();

      return res.json({ message: 'Configurações do WhatsApp atualizadas.', settings: updated });
    } catch (err) {
      next(err);
    }
  };

  generateBackup = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      
      const dbHost = process.env.DB_HOST || 'localhost';
      const dbPort = process.env.DB_PORT || '5432';
      const dbUser = process.env.DB_USER || 'postgres';
      const dbPass = process.env.DB_PASSWORD || 'postgres';
      const dbName = process.env.DB_NAME || 'horizon';

      const fileName = `backup_horizon_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
      const filePath = path.join(process.cwd(), 'uploads', fileName);

      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const dumpCmd = `SET PGPASSWORD=${dbPass}&& pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -F p -d ${dbName} -f "${filePath}"`;

      await execAsync(dumpCmd);

      await LoggerService.log({
        user_id: userId,
        modulo: 'configuracoes',
        acao: 'backup_manual',
        descricao: 'Backup manual do banco de dados solicitado e exportado.',
        ip: req.ip
      });

      res.download(filePath, fileName, (err) => {
        if (err) console.error('Erro no download:', err);
        fs.unlink(filePath, (e) => {
          if (e) console.error('Erro ao deletar arquivo de backup local:', e);
        });
      });

    } catch (err) {
      console.error('Erro ao gerar backup:', err);
      res.status(500).json({ 
        message: 'Falha ao gerar o backup. Verifique se o utilitário pg_dump está instalado e acessível no ambiente do servidor.'
      });
    }
  };
}

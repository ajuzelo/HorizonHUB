import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 3001,
  JWT_SECRET: process.env.JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: Number(process.env.DB_PORT) || 5432,
    NAME: process.env.DB_NAME || 'horizonhub',
    USER: process.env.DB_USER || 'horizonhub',
    PASSWORD: process.env.DB_PASSWORD || 'horizonhub_secret',
  },
  SMTP: {
    HOST: process.env.SMTP_HOST || '',
    PORT: Number(process.env.SMTP_PORT) || 587,
    USER: process.env.SMTP_USER || '',
    PASS: process.env.SMTP_PASS || '',
    FROM_NAME: process.env.SMTP_FROM_NAME || 'Horizon HUB',
    FROM_EMAIL: process.env.SMTP_FROM_EMAIL || '',
  },
} as const;

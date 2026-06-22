import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import db from './config/database';
import { router } from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// ── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// ── Logging ───────────────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', router);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    await db.raw('SELECT 1');
    res.json({
      status: 'ok',
      app: 'Horizon HUB API',
      version: '1.0.0',
      db: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: 'error',
      db: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────
async function bootstrap() {
  try {
    // Test DB connection
    await db.raw('SELECT 1');
    console.log('✅ Banco de dados conectado.');

    app.listen(env.PORT, () => {
      console.log(`
╔══════════════════════════════════════════╗
║        🌐  Horizon HUB — API             ║
║──────────────────────────────────────────║
║  Ambiente : ${env.NODE_ENV.padEnd(28)}║
║  Porta    : ${String(env.PORT).padEnd(28)}║
║  Banco    : ${env.DB.NAME.padEnd(28)}║
╚══════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('❌ Falha ao iniciar o servidor:', err);
    process.exit(1);
  }
}

bootstrap();

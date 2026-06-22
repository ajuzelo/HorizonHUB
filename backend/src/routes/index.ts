import { Router } from 'express';
import { authRouter } from './authRoutes';
import { setupRouter } from './setupRoutes';
import { tasksRouter } from './tasksRoutes';
import { notesRouter } from './notesRoutes';
import { dashboardRouter } from './dashboardRoutes';
import { accountsPayableRouter } from './accountsPayableRoutes';
import { xmlRouter } from './xmlRoutes';
import { settingsRouter } from './settingsRoutes';
import { nfClientsRouter } from './nfClientsRoutes';
import { emailTemplatesRouter } from './emailTemplatesRoutes';
import { emailRouter } from './emailRoutes';
import { whatsappTemplatesRouter } from './whatsappTemplatesRoutes';
import { whatsappHistoryRouter } from './whatsappHistoryRoutes';

// Personal Finance Phase 8
import { personalCategoriesRouter } from './personalCategoriesRoutes';
import { personalWalletsRouter } from './personalWalletsRoutes';
import { personalCardsRouter } from './personalCardsRoutes';
import { personalAccountsRouter } from './personalAccountsRoutes';
import { personalGoalsRouter } from './personalGoalsRoutes';

import { logsRouter } from './logsRoutes';

import { authenticate } from '../middleware/authenticate';

export const router = Router();

// Public routes (no auth)
router.use('/setup', setupRouter);
router.use('/auth', authRouter);

// Protected routes
router.use('/dashboard', authenticate, dashboardRouter);
router.use('/tasks', authenticate, tasksRouter);
router.use('/notes', authenticate, notesRouter);
router.use('/accounts-payable', authenticate, accountsPayableRouter);
router.use('/xml', authenticate, xmlRouter);
router.use('/settings', authenticate, settingsRouter);
router.use('/nf-clients', authenticate, nfClientsRouter);
router.use('/email-templates', authenticate, emailTemplatesRouter);
router.use('/email', authenticate, emailRouter);
router.use('/whatsapp-templates', authenticate, whatsappTemplatesRouter);
router.use('/whatsapp-history', authenticate, whatsappHistoryRouter);

// Personal Finance API
router.use('/personal-categories', authenticate, personalCategoriesRouter);
router.use('/personal-wallets', authenticate, personalWalletsRouter);
router.use('/personal-cards', authenticate, personalCardsRouter);
router.use('/personal-accounts', authenticate, personalAccountsRouter);
router.use('/personal-goals', authenticate, personalGoalsRouter);

// Logs API
router.use('/logs', authenticate, logsRouter);



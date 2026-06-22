import { Router } from 'express';
import { SettingsController } from '../controllers/settingsController';

export const settingsRouter = Router();
const ctrl = new SettingsController();

settingsRouter.get('/', ctrl.getSettings);
settingsRouter.put('/ui', ctrl.updateUi);
settingsRouter.put('/smtp', ctrl.updateSmtp);
settingsRouter.put('/whatsapp', ctrl.updateWhatsapp);
settingsRouter.get('/backup/download', ctrl.generateBackup);

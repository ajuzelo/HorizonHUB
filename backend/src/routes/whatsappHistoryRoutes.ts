import { Router } from 'express';
import { WhatsappHistoryController } from '../controllers/whatsappHistoryController';

export const whatsappHistoryRouter = Router();
const ctrl = new WhatsappHistoryController();

whatsappHistoryRouter.get('/', ctrl.listHistory);
whatsappHistoryRouter.post('/', ctrl.logSend);
whatsappHistoryRouter.put('/:id/status', ctrl.updateStatus);

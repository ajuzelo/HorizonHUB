import { Router } from 'express';
import { WhatsappTemplatesController } from '../controllers/whatsappTemplatesController';

export const whatsappTemplatesRouter = Router();
const ctrl = new WhatsappTemplatesController();

whatsappTemplatesRouter.get('/', ctrl.list);
whatsappTemplatesRouter.post('/', ctrl.create);
whatsappTemplatesRouter.put('/:id', ctrl.update);
whatsappTemplatesRouter.delete('/:id', ctrl.delete);

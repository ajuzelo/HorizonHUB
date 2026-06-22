import { Router } from 'express';
import { EmailTemplatesController } from '../controllers/emailTemplatesController';

export const emailTemplatesRouter = Router();
const ctrl = new EmailTemplatesController();

emailTemplatesRouter.get('/', ctrl.list);
emailTemplatesRouter.post('/', ctrl.create);
emailTemplatesRouter.put('/:id', ctrl.update);
emailTemplatesRouter.delete('/:id', ctrl.delete);

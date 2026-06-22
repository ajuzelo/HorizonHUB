import { Router } from 'express';
import { EmailController, attachmentUpload } from '../controllers/emailController';

export const emailRouter = Router();
const ctrl = new EmailController();

emailRouter.get('/history', ctrl.listHistory);
emailRouter.post('/send', attachmentUpload.array('attachments', 10), ctrl.send);

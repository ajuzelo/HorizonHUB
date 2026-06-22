import { Router } from 'express';
import { LogsController } from '../controllers/logsController';

export const logsRouter = Router();
const ctrl = new LogsController();

logsRouter.get('/', ctrl.list);

import { Router } from 'express';
import { TasksController } from '../controllers/tasksController';

export const tasksRouter = Router();
const controller = new TasksController();

tasksRouter.get('/', controller.list);
tasksRouter.get('/summary', controller.summary);
tasksRouter.get('/pending-yesterday', controller.pendingYesterday);
tasksRouter.get('/export/txt', controller.exportTxt);
tasksRouter.post('/', controller.create);
tasksRouter.post('/import-yesterday', controller.importYesterday);
tasksRouter.put('/:id', controller.update);
tasksRouter.patch('/:id/toggle', controller.toggle);
tasksRouter.delete('/:id', controller.delete);

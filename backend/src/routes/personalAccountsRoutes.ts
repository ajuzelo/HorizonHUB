import { Router } from 'express';
import { PersonalAccountsController } from '../controllers/personalAccountsController';

export const personalAccountsRouter = Router();
const ctrl = new PersonalAccountsController();

personalAccountsRouter.get('/', ctrl.list);
personalAccountsRouter.post('/', ctrl.create);
personalAccountsRouter.put('/:id', ctrl.update);
personalAccountsRouter.delete('/:id', ctrl.delete);
personalAccountsRouter.patch('/:id/toggle', ctrl.toggleStatus);

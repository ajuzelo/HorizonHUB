import { Router } from 'express';
import { AccountsPayableController } from '../controllers/accountsPayableController';

export const accountsPayableRouter = Router();
const ctrl = new AccountsPayableController();

accountsPayableRouter.get('/', ctrl.list);
accountsPayableRouter.get('/dashboard', ctrl.dashboardSummary);
accountsPayableRouter.get('/lojas', ctrl.getLojas);
accountsPayableRouter.post('/', ctrl.create);
accountsPayableRouter.put('/:id', ctrl.update);
accountsPayableRouter.patch('/:id/toggle', ctrl.toggle);
accountsPayableRouter.delete('/:id', ctrl.delete);

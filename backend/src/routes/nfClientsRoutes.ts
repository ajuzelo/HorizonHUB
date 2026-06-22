import { Router } from 'express';
import { NfClientsController } from '../controllers/nfClientsController';

export const nfClientsRouter = Router();
const ctrl = new NfClientsController();

nfClientsRouter.get('/', ctrl.list);
nfClientsRouter.post('/', ctrl.create);
nfClientsRouter.put('/:id', ctrl.update);
nfClientsRouter.delete('/:id', ctrl.delete);

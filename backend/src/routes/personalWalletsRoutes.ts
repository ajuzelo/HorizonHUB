import { Router } from 'express';
import { PersonalWalletsController } from '../controllers/personalWalletsController';

export const personalWalletsRouter = Router();
const ctrl = new PersonalWalletsController();

personalWalletsRouter.get('/', ctrl.list);
personalWalletsRouter.post('/', ctrl.create);
personalWalletsRouter.put('/:id', ctrl.update);
personalWalletsRouter.delete('/:id', ctrl.delete);

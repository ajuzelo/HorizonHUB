import { Router } from 'express';
import { PersonalCardsController } from '../controllers/personalCardsController';

export const personalCardsRouter = Router();
const ctrl = new PersonalCardsController();

personalCardsRouter.get('/', ctrl.list);
personalCardsRouter.post('/', ctrl.create);
personalCardsRouter.put('/:id', ctrl.update);
personalCardsRouter.delete('/:id', ctrl.delete);

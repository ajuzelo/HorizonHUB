import { Router } from 'express';
import { PersonalGoalsController } from '../controllers/personalGoalsController';

export const personalGoalsRouter = Router();
const ctrl = new PersonalGoalsController();

personalGoalsRouter.get('/', ctrl.list);
personalGoalsRouter.post('/', ctrl.create);
personalGoalsRouter.put('/:id', ctrl.update);
personalGoalsRouter.delete('/:id', ctrl.delete);

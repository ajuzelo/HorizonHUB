import { Router } from 'express';
import { PersonalCategoriesController } from '../controllers/personalCategoriesController';

export const personalCategoriesRouter = Router();
const ctrl = new PersonalCategoriesController();

personalCategoriesRouter.get('/', ctrl.list);
personalCategoriesRouter.post('/', ctrl.create);
personalCategoriesRouter.put('/:id', ctrl.update);
personalCategoriesRouter.delete('/:id', ctrl.delete);

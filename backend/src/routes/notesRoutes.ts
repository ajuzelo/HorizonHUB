import { Router } from 'express';
import { NotesController } from '../controllers/notesController';

export const notesRouter = Router();
const controller = new NotesController();

notesRouter.get('/', controller.list);
notesRouter.get('/summary', controller.summary);
notesRouter.post('/', controller.create);
notesRouter.put('/:id', controller.update);
notesRouter.patch('/:id/pin', controller.togglePin);
notesRouter.delete('/:id', controller.delete);

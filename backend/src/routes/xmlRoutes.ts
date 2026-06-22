import { Router } from 'express';
import { XmlController, xmlUpload } from '../controllers/xmlController';

export const xmlRouter = Router();
const ctrl = new XmlController();

xmlRouter.get('/', ctrl.list);
xmlRouter.get('/summary', ctrl.summary);
xmlRouter.get('/:id', ctrl.getById);
xmlRouter.post('/upload', xmlUpload.single('xml'), ctrl.upload);
xmlRouter.delete('/:id', ctrl.delete);

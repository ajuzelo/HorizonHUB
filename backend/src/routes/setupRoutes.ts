import { Router } from 'express';
import { SetupController } from '../controllers/setupController';

export const setupRouter = Router();
const controller = new SetupController();

// Check if system has been initialized
setupRouter.get('/status', controller.getStatus);

// Create the first admin user
setupRouter.post('/initialize', controller.initialize);

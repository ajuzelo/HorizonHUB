import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';

export const dashboardRouter = Router();
const controller = new DashboardController();

dashboardRouter.get('/', controller.summary);

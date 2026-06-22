import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/authenticate';

export const authRouter = Router();
const controller = new AuthController();

authRouter.post('/login', controller.login);
authRouter.post('/logout', authenticate, controller.logout);
authRouter.get('/me', authenticate, controller.me);
authRouter.put('/profile/active', authenticate, controller.setActiveProfile);

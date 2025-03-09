import { Router } from 'express';
import { authController } from '../controller/auth.controller';

const router = Router();


router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
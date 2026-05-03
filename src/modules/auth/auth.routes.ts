import Router from '@koa/router';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { validate } from '../../shared/middlewares/validate';
import { authenticate } from '../../shared/middlewares/authenticate';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schema';

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

const router = new Router({ prefix: '/api/v1/auth' });

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register new student
 *     tags: [Auth]
 */
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

export default router;
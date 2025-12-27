import { Router } from '../../interfaces';
import { AuthController } from '../../controllers/auth.controller';
import { validate } from '../../middleware/validation.middleware';
import { loginSchema, refreshTokenSchema, logoutSchema } from '../../validators/auth.validator';
import { asyncHandler } from '../../utils/async-handler';
import { container } from '../../../di/container';

export const setupAuthRoutes = (router: Router): void => {
  const authController = container.resolve(AuthController);

  router.post('/auth/login', validate(loginSchema), asyncHandler(authController.login.bind(authController)));
  router.post('/auth/refresh', validate(refreshTokenSchema), asyncHandler(authController.refreshToken.bind(authController)));
  router.post('/auth/logout', validate(logoutSchema), asyncHandler(authController.logout.bind(authController)));
};

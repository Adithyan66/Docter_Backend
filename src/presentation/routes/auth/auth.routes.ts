import { Router } from '../../interfaces';
import { DoctorController } from '../../controllers/doctor.controller';
import { validate } from '../../middleware/validation.middleware';
import { loginSchema, refreshTokenSchema, logoutSchema } from '../../validators/doctor.validator';
import { asyncHandler } from '../../utils/async-handler';
import { container } from '../../../di/container';

export const setupAuthRoutes = (router: Router): void => {
  const doctorController = container.resolve(DoctorController);

  router.post('/auth/login', validate(loginSchema), asyncHandler(doctorController.login.bind(doctorController)));
  router.post('/auth/refresh', validate(refreshTokenSchema), asyncHandler(doctorController.refreshToken.bind(doctorController)));
  router.post('/auth/logout', validate(logoutSchema), asyncHandler(doctorController.logout.bind(doctorController)));
};

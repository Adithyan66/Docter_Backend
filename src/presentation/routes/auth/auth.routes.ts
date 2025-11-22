import { Router } from '../../interfaces';
import { DoctorController } from '../../controllers/doctor.controller';
import { validate } from '../../middleware/validation.middleware';
import { loginSchema } from '../../validators/doctor.validator';
import { asyncHandler } from '../../utils/async-handler';

export const setupAuthRoutes = (router: Router): void => {
  const doctorController = new DoctorController();

  router.post('/auth/login', validate(loginSchema), asyncHandler(doctorController.login.bind(doctorController)));
};

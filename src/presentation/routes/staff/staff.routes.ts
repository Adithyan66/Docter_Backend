import { Router } from '../../interfaces';
import { container } from '../../../di/container';
import { StaffController } from '../../controllers/staff.controller';
import { validate } from '../../middleware/validation.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { doctorOnly } from '../../middleware/role.middleware';
import { createStaffSchema, updateStaffSchema } from '../../validators/staff.validator';
import { asyncHandler } from '../../utils/async-handler';

export const setupStaffRoutes = (router: Router): void => {
  const staffController = container.resolve(StaffController);
  const auth = authMiddleware();
  

  router.post('/staff', auth, doctorOnly, validate(createStaffSchema), asyncHandler(staffController.create.bind(staffController)));
  router.patch('/staff/:id', auth, doctorOnly, validate(updateStaffSchema), asyncHandler(staffController.update.bind(staffController)));
  router.delete('/staff/:id', auth, doctorOnly, asyncHandler(staffController.delete.bind(staffController)));
  router.get('/staff/:id', auth, doctorOnly, asyncHandler(staffController.getById.bind(staffController)));
  router.get('/staff', auth, doctorOnly, asyncHandler(staffController.getAll.bind(staffController)));
};



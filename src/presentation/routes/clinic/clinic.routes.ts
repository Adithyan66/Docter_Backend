import { Router } from '../../interfaces';
import { ClinicController } from '../../controllers/clinic.controller';
import { validate } from '../../middleware/validation.middleware';
import { createClinicSchema, updateClinicSchema } from '../../validators/clinic.validator';
import { asyncHandler } from '../../utils/async-handler';
import { container } from '../../../di/container';
import { authMiddleware } from '../../middleware/auth.middleware';

export const setupClinicRoutes = (router: Router): void => {
  const clinicController = container.resolve(ClinicController);
  const auth = authMiddleware();

  router.post('/clinic/add', auth, validate(createClinicSchema), asyncHandler(clinicController.create.bind(clinicController)));

  router.get('/clinic/all', auth, asyncHandler(clinicController.getAll.bind(clinicController)));
  
  router.get('/clinic/names', auth, asyncHandler(clinicController.getNames.bind(clinicController)));
  
  router.patch('/clinic/:id', auth, validate(updateClinicSchema), asyncHandler(clinicController.update.bind(clinicController)));
  
  router.delete('/clinic/:id', auth, asyncHandler(clinicController.delete.bind(clinicController)));
  
  router.get('/clinic/:id', auth, asyncHandler(clinicController.getById.bind(clinicController)));
};


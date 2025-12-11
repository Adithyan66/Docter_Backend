import { Router } from '../../interfaces';
import { ClinicController } from '../../controllers/clinic.controller';
import { validate } from '../../middleware/validation.middleware';
import { createClinicSchema, updateClinicSchema } from '../../validators/clinic.validator';
import { asyncHandler } from '../../utils/async-handler';
import { container } from '../../../di/container';
import { authMiddleware } from '../../middleware/auth.middleware';
import { doctorOnly } from '../../middleware/role.middleware';

export const setupClinicRoutes = (router: Router): void => {
  const clinicController = container.resolve(ClinicController);
  const auth = authMiddleware();

  router.post('/clinic/add', auth, doctorOnly, validate(createClinicSchema), asyncHandler(clinicController.create.bind(clinicController)));

  router.get('/clinic/all', auth, doctorOnly, asyncHandler(clinicController.getAll.bind(clinicController)));
  
  router.get('/clinic/names', auth, doctorOnly, asyncHandler(clinicController.getNames.bind(clinicController)));
  
  router.patch('/clinic/:id', auth,doctorOnly, validate(updateClinicSchema), asyncHandler(clinicController.update.bind(clinicController)));
  
  router.delete('/clinic/:id', auth, doctorOnly, asyncHandler(clinicController.delete.bind(clinicController)));
  
  router.get('/clinic/:id', auth, asyncHandler(clinicController.getById.bind(clinicController)));
};


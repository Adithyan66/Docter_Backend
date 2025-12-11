import { Router } from '../../interfaces';
import { TreatmentController } from '../../controllers/treatment.controller';
import { validate } from '../../middleware/validation.middleware';
import { createTreatmentSchema, updateTreatmentSchema } from '../../validators/treatment.validator';
import { asyncHandler } from '../../utils/async-handler';
import { container } from '../../../di/container';
import { authMiddleware } from '../../middleware/auth.middleware';
import { doctorOnly } from '../../middleware/role.middleware';

export const setupTreatmentRoutes = (router: Router): void => {
  const treatmentController = container.resolve(TreatmentController);
  const auth = authMiddleware();

  router.post('/treatment/add',  auth, doctorOnly, validate(createTreatmentSchema), asyncHandler(treatmentController.create.bind(treatmentController)));

  router.get('/treatment/all', auth, doctorOnly, asyncHandler(treatmentController.getAll.bind(treatmentController)));
  
  router.get('/treatment/names', auth, asyncHandler(treatmentController.getNames.bind(treatmentController)));
  
  router.patch('/treatment/:id', auth, doctorOnly, validate(updateTreatmentSchema), asyncHandler(treatmentController.update.bind(treatmentController)));
  
  router.delete('/treatment/:id', auth, doctorOnly, asyncHandler(treatmentController.delete.bind(treatmentController)));
  
  router.get('/treatment/:id', auth, doctorOnly, asyncHandler(treatmentController.getById.bind(treatmentController)));
};


import { Router } from '../../interfaces';
import { TreatmentController } from '../../controllers/treatment.controller';
import { validate } from '../../middleware/validation.middleware';
import { createTreatmentSchema, updateTreatmentSchema } from '../../validators/treatment.validator';
import { asyncHandler } from '../../utils/async-handler';
import { container } from '../../../di/container';
import { authMiddleware } from '../../middleware/auth.middleware';

export const setupTreatmentRoutes = (router: Router): void => {
  const treatmentController = container.resolve(TreatmentController);
  const auth = authMiddleware();

  router.post('/treatment/add', auth, validate(createTreatmentSchema), asyncHandler(treatmentController.create.bind(treatmentController)));
  router.patch('/treatment/:id', auth, validate(updateTreatmentSchema), asyncHandler(treatmentController.update.bind(treatmentController)));
  router.delete('/treatment/:id', auth, asyncHandler(treatmentController.delete.bind(treatmentController)));
  router.get('/treatment/:id', auth, asyncHandler(treatmentController.getById.bind(treatmentController)));
  router.get('/treatment/all', auth, asyncHandler(treatmentController.getAll.bind(treatmentController)));
};


import { Router } from '../../interfaces';
import { TreatmentCourseController } from '../../controllers/treatment-course.controller';
import { validate } from '../../middleware/validation.middleware';
import { createTreatmentCourseSchema, updateTreatmentCourseSchema } from '../../validators/treatment-course.validator';
import { asyncHandler } from '../../utils/async-handler';
import { container } from '../../../di/container';
import { authMiddleware } from '../../middleware/auth.middleware';

export const setupTreatmentCourseRoutes = (router: Router): void => {
  const treatmentCourseController = container.resolve(TreatmentCourseController);
  const auth = authMiddleware();

  router.post('/treatment-course/add', auth, validate(createTreatmentCourseSchema), asyncHandler(treatmentCourseController.create.bind(treatmentCourseController)));

  router.get('/treatment-course/all', auth, asyncHandler(treatmentCourseController.getAll.bind(treatmentCourseController)));

  router.get('/treatment-course/:id', auth, asyncHandler(treatmentCourseController.getById.bind(treatmentCourseController)));

  router.patch('/treatment-course/:id', auth, validate(updateTreatmentCourseSchema), asyncHandler(treatmentCourseController.update.bind(treatmentCourseController)));

  router.delete('/treatment-course/:id', auth, asyncHandler(treatmentCourseController.delete.bind(treatmentCourseController)));
};


import { Router } from '../../interfaces';
import { VisitController } from '../../controllers/visit.controller';
import { validate } from '../../middleware/validation.middleware';
import { createVisitSchema, updateVisitSchema } from '../../validators/visit.validator';
import { asyncHandler } from '../../utils/async-handler';
import { container } from '../../../di/container';
import { authMiddleware } from '../../middleware/auth.middleware';
import { doctorOnly } from '../../middleware/role.middleware';

export const setupVisitRoutes = (router: Router): void => {
  const visitController = container.resolve(VisitController);
  const auth = authMiddleware();

  router.post('/visit/add', auth, doctorOnly, validate(createVisitSchema), asyncHandler(visitController.create.bind(visitController)));

  router.get('/visits/all', auth, asyncHandler(visitController.getAll.bind(visitController)));

  router.get('/visit/:id', auth, asyncHandler(visitController.getById.bind(visitController)));

  router.patch('/visit/:id', auth, doctorOnly ,validate(updateVisitSchema), asyncHandler(visitController.update.bind(visitController)));

  router.delete('/visit/:id', auth,doctorOnly, asyncHandler(visitController.delete.bind(visitController)));

  router.get('/reminders/visits', auth, asyncHandler(visitController.getVisitReminders.bind(visitController)));
};


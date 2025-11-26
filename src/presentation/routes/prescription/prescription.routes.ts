import { Router } from '../../interfaces';
import { PrescriptionController } from '../../controllers/prescription.controller';
import { validate } from '../../middleware/validation.middleware';
import { createPrescriptionSchema, updatePrescriptionSchema } from '../../validators/prescription.validator';
import { asyncHandler } from '../../utils/async-handler';
import { container } from '../../../di/container';
import { authMiddleware } from '../../middleware/auth.middleware';

export const setupPrescriptionRoutes = (router: Router): void => {
  const prescriptionController = container.resolve(PrescriptionController);
  const auth = authMiddleware();

  router.post('/prescription/add', auth, validate(createPrescriptionSchema), asyncHandler(prescriptionController.create.bind(prescriptionController)));

  router.get('/prescription/all', auth, asyncHandler(prescriptionController.getAll.bind(prescriptionController)));

  router.get('/prescription/:id', auth, asyncHandler(prescriptionController.getById.bind(prescriptionController)));

  router.patch('/prescription/:id', auth, validate(updatePrescriptionSchema), asyncHandler(prescriptionController.update.bind(prescriptionController)));

  router.delete('/prescription/:id', auth, asyncHandler(prescriptionController.delete.bind(prescriptionController)));
};


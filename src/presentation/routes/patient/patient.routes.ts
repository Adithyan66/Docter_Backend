import { DependencyContainer } from 'tsyringe';
import { Router } from '../../interfaces';
import { PatientController } from '../../controllers/patient.controller';
import { validate } from '../../middleware/validation.middleware';
import { createPatientSchema, updatePatientSchema } from '../../validators/patient.validator';
import { asyncHandler } from '../../utils/async-handler';
import { authMiddleware } from '../../middleware/auth.middleware';
import { doctorOnly } from '../../middleware/role.middleware';

export const setupPatientRoutes = (router: Router, resolver: DependencyContainer): void => {
  const patientController = resolver.resolve(PatientController);
  const auth = authMiddleware(resolver);

  router.post('/patient/add', auth, validate(createPatientSchema), asyncHandler(patientController.create.bind(patientController)));

  router.get('/patient/all', auth, asyncHandler(patientController.getAll.bind(patientController)));

  router.get('/patient/:id', auth, asyncHandler(patientController.getById.bind(patientController)));

  router.patch('/patient/:id', auth, validate(updatePatientSchema), asyncHandler(patientController.update.bind(patientController)));

  router.delete('/patient/:id', auth, doctorOnly, asyncHandler(patientController.delete.bind(patientController)));

  router.patch('/patient/:id/restore', auth, asyncHandler(patientController.restore.bind(patientController)));
};



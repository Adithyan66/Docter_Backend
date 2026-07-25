import { DependencyContainer } from 'tsyringe';
import { Router } from '../../interfaces';
import { ClinicController } from '../../controllers/clinic.controller';
import { validate } from '../../middleware/validation.middleware';
import { createClinicSchema, updateClinicSchema, addClinicImagesSchema } from '../../validators/clinic.validator';
import { asyncHandler } from '../../utils/async-handler';
import { authMiddleware } from '../../middleware/auth.middleware';
import { doctorOnly } from '../../middleware/role.middleware';

export const setupClinicRoutes = (router: Router, resolver: DependencyContainer): void => {
  const clinicController = resolver.resolve(ClinicController);
  const auth = authMiddleware(resolver);

  router.post('/clinic/add', auth, doctorOnly, validate(createClinicSchema), asyncHandler(clinicController.create.bind(clinicController)));

  router.get('/clinic/all', auth, doctorOnly, asyncHandler(clinicController.getAll.bind(clinicController)));
  
  router.get('/clinic/names', auth, doctorOnly, asyncHandler(clinicController.getNames.bind(clinicController)));
  
  router.patch('/clinic/:id', auth,doctorOnly, validate(updateClinicSchema), asyncHandler(clinicController.update.bind(clinicController)));
  
  router.delete('/clinic/:id', auth, doctorOnly, asyncHandler(clinicController.delete.bind(clinicController)));
  
  router.get('/clinic/:id/images', auth, asyncHandler(clinicController.getImages.bind(clinicController)));
  
  router.post('/clinic/:id/images', auth, doctorOnly, validate(addClinicImagesSchema), asyncHandler(clinicController.addImages.bind(clinicController)));
  
  router.delete('/clinic/:id/images/:imageIndex', auth, asyncHandler(clinicController.deleteImage.bind(clinicController)));
  
  router.get('/clinic/:id', auth, asyncHandler(clinicController.getById.bind(clinicController)));
};


import { DependencyContainer } from 'tsyringe';
import { Router } from '../../interfaces';
import { ImageServiceController } from '../../controllers/image-service.controller';
import { asyncHandler } from '../../utils/async-handler';
import { authMiddleware } from '../../middleware/auth.middleware';

export const setupImageRoutes = (router: Router, resolver: DependencyContainer): void => {
  const imageServiceController = resolver.resolve(ImageServiceController);
  const auth = authMiddleware(resolver);

  router.post('/image-upload/:type', auth, asyncHandler(imageServiceController.generateUploadUrl.bind(imageServiceController)));
  
  router.get('/image-download', auth, asyncHandler(imageServiceController.generateDownloadUrl.bind(imageServiceController)));
};


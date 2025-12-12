import { Router } from '../../interfaces';
import { ImageServiceController } from '../../controllers/image-service.controller';
import { asyncHandler } from '../../utils/async-handler';
import { container } from '../../../di/container';
import { authMiddleware } from '../../middleware/auth.middleware';

export const setupImageRoutes = (router: Router): void => {
  const imageServiceController = container.resolve(ImageServiceController);
  const auth = authMiddleware();

  router.post('/image-upload/:type', auth, asyncHandler(imageServiceController.generateUploadUrl.bind(imageServiceController)));
  
  router.get('/image-download', auth, asyncHandler(imageServiceController.generateDownloadUrl.bind(imageServiceController)));
};


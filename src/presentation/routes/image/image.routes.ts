import { Router } from '../../interfaces';
import { ImageServiceController } from '../../controllers/image-service.controller';
import { asyncHandler } from '../../utils/async-handler';
import { container } from '../../../di/container';
import { authMiddleware } from '../../middleware/auth.middleware';

export const setupImageRoutes = (router: Router): void => {
  const imageServiceController = container.resolve(ImageServiceController);

  router.post('/image-upload/:type',authMiddleware(), asyncHandler(imageServiceController.generateUploadUrl.bind(imageServiceController)));
};


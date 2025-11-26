import { Router } from '../../interfaces';
import { MediaController } from '../../controllers/media.controller';
import { validate } from '../../middleware/validation.middleware';
import { createMediaSchema, updateMediaSchema } from '../../validators/media.validator';
import { asyncHandler } from '../../utils/async-handler';
import { container } from '../../../di/container';
import { authMiddleware } from '../../middleware/auth.middleware';

export const setupMediaRoutes = (router: Router): void => {
  const mediaController = container.resolve(MediaController);
  const auth = authMiddleware();

  router.post('/media/add', auth, validate(createMediaSchema), asyncHandler(mediaController.create.bind(mediaController)));

  router.get('/media/all', auth, asyncHandler(mediaController.getAll.bind(mediaController)));

  router.get('/media/:id', auth, asyncHandler(mediaController.getById.bind(mediaController)));

  router.patch('/media/:id', auth, validate(updateMediaSchema), asyncHandler(mediaController.update.bind(mediaController)));

  router.delete('/media/:id', auth, asyncHandler(mediaController.delete.bind(mediaController)));
};


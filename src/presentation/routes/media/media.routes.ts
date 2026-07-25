import { DependencyContainer } from 'tsyringe';
import { Router } from '../../interfaces';
import { MediaController } from '../../controllers/media.controller';
import { validate } from '../../middleware/validation.middleware';
import { createMediaSchema, updateMediaSchema } from '../../validators/media.validator';
import { asyncHandler } from '../../utils/async-handler';
import { authMiddleware } from '../../middleware/auth.middleware';

export const setupMediaRoutes = (router: Router, resolver: DependencyContainer): void => {
  const mediaController = resolver.resolve(MediaController);
  const auth = authMiddleware(resolver);

  router.post('/media/add', auth, validate(createMediaSchema), asyncHandler(mediaController.create.bind(mediaController)));

  router.get('/media/all', auth, asyncHandler(mediaController.getAll.bind(mediaController)));

  router.get('/media/:id', auth, asyncHandler(mediaController.getById.bind(mediaController)));

  router.patch('/media/:id', auth, validate(updateMediaSchema), asyncHandler(mediaController.update.bind(mediaController)));

  router.delete('/media/:id', auth, asyncHandler(mediaController.delete.bind(mediaController)));
};


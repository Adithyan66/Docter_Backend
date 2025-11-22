import { Router } from '../interfaces';
import { ExampleController } from '../controllers/example.controller';
import { validate } from '../middleware/validation.middleware';
import { createExampleSchema } from '../validators/example.validator';
import { asyncHandler } from '../utils/async-handler';

export const setupExampleRoutes = (router: Router): void => {
  const exampleController = new ExampleController();

  router.post('/', validate(createExampleSchema), asyncHandler(exampleController.create.bind(exampleController)));

  router.get('/', asyncHandler(exampleController.findAll.bind(exampleController)));
};
 
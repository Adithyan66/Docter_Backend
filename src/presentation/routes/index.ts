import { Router } from '../interfaces';
import { setupExampleRoutes } from './example.routes';
import { setupAuthRoutes } from './auth/auth.routes';

export const setupRoutes = (router: Router): void => {
  setupExampleRoutes(router);
  setupAuthRoutes(router);
};


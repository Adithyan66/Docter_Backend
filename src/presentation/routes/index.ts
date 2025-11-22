import { Router } from '../interfaces';
import { setupAuthRoutes } from './auth/auth.routes';

export const setupRoutes = (router: Router): void => {
  setupAuthRoutes(router);
};


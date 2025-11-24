import { Router } from '../interfaces';
import { setupAuthRoutes } from './auth/auth.routes';
import { setupImageRoutes } from './image/image.routes';
import { setupTreatmentRoutes } from './treatment/treatment.routes';

export const setupRoutes = (router: Router): void => {
  setupAuthRoutes(router);
  setupImageRoutes(router);
  setupTreatmentRoutes(router);
};


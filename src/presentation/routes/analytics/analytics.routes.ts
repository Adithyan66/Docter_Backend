import { DependencyContainer } from 'tsyringe';
import { Router } from '../../interfaces';
import { AnalyticsController } from '../../controllers/analytics.controller';
import { asyncHandler } from '../../utils/async-handler';
import { authMiddleware } from '../../middleware/auth.middleware';

export const setupAnalyticsRoutes = (router: Router, resolver: DependencyContainer): void => {
  const analyticsController = resolver.resolve(AnalyticsController);
  const auth = authMiddleware(resolver);

  // Open to staff as well as doctors — the controller narrows staff to their clinic.
  router.get('/analytics/financial/dashboard', auth, asyncHandler(analyticsController.getDashboard.bind(analyticsController)));
};

import { Router } from '../../interfaces';
import { AnalyticsController } from '../../controllers/analytics.controller';
import { asyncHandler } from '../../utils/async-handler';
import { container } from '../../../di/container';
import { authMiddleware } from '../../middleware/auth.middleware';

export const setupAnalyticsRoutes = (router: Router): void => {
  const analyticsController: AnalyticsController = container.resolve<AnalyticsController>('AnalyticsController');
  const auth = authMiddleware();

  router.get('/analytics/financial/dashboard', auth, asyncHandler(analyticsController.getDashboard.bind(analyticsController)));
};



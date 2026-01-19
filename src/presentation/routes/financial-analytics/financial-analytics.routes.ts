import { Router } from '../../interfaces';
import { FinancialAnalyticsController } from '../../controllers/financial-analytics.controller';
import { asyncHandler } from '../../utils/async-handler';
import { container } from '../../../di/container';
import { authMiddleware } from '../../middleware/auth.middleware';

export const setupFinancialAnalyticsRoutes = (router: Router): void => {
  const financialAnalyticsController = container.resolve(FinancialAnalyticsController);
  const auth = authMiddleware();

  router.get('/financial/dashboard', auth, asyncHandler(financialAnalyticsController.getDashboard.bind(financialAnalyticsController)));
};


import { DependencyContainer } from 'tsyringe';
import { Router } from '../../interfaces';
import { DailyActivityController } from '../../controllers/daily-activity.controller';
import { asyncHandler } from '../../utils/async-handler';
import { authMiddleware } from '../../middleware/auth.middleware';

export const setupDailyActivityRoutes = (router: Router, resolver: DependencyContainer): void => {
  const dailyActivityController = resolver.resolve(DailyActivityController);
  const auth = authMiddleware(resolver);

  router.get('/daily-activities', auth, asyncHandler(dailyActivityController.getAll.bind(dailyActivityController)));
};


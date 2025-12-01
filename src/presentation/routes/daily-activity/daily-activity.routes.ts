import { Router } from '../../interfaces';
import { DailyActivityController } from '../../controllers/daily-activity.controller';
import { asyncHandler } from '../../utils/async-handler';
import { container } from '../../../di/container';
import { authMiddleware } from '../../middleware/auth.middleware';

export const setupDailyActivityRoutes = (router: Router): void => {
  const dailyActivityController = container.resolve(DailyActivityController);
  const auth = authMiddleware();

  router.get('/daily-activities', auth, asyncHandler(dailyActivityController.getAll.bind(dailyActivityController)));
};


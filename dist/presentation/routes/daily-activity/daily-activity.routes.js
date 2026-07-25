"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDailyActivityRoutes = void 0;
const daily_activity_controller_1 = require("../../controllers/daily-activity.controller");
const async_handler_1 = require("../../utils/async-handler");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const setupDailyActivityRoutes = (router, resolver) => {
    const dailyActivityController = resolver.resolve(daily_activity_controller_1.DailyActivityController);
    const auth = (0, auth_middleware_1.authMiddleware)(resolver);
    router.get('/daily-activities', auth, (0, async_handler_1.asyncHandler)(dailyActivityController.getAll.bind(dailyActivityController)));
};
exports.setupDailyActivityRoutes = setupDailyActivityRoutes;

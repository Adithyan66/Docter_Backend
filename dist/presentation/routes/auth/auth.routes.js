"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAuthRoutes = void 0;
const auth_controller_1 = require("../../controllers/auth.controller");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const auth_validator_1 = require("../../validators/auth.validator");
const async_handler_1 = require("../../utils/async-handler");
const setupAuthRoutes = (router, resolver) => {
    const authController = resolver.resolve(auth_controller_1.AuthController);
    router.post('/auth/login', (0, validation_middleware_1.validate)(auth_validator_1.loginSchema), (0, async_handler_1.asyncHandler)(authController.login.bind(authController)));
    router.post('/auth/refresh', (0, validation_middleware_1.validate)(auth_validator_1.refreshTokenSchema), (0, async_handler_1.asyncHandler)(authController.refreshToken.bind(authController)));
    router.post('/auth/logout', (0, validation_middleware_1.validate)(auth_validator_1.logoutSchema), (0, async_handler_1.asyncHandler)(authController.logout.bind(authController)));
};
exports.setupAuthRoutes = setupAuthRoutes;

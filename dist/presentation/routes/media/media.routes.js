"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMediaRoutes = void 0;
const media_controller_1 = require("../../controllers/media.controller");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const media_validator_1 = require("../../validators/media.validator");
const async_handler_1 = require("../../utils/async-handler");
const container_1 = require("../../../di/container");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const setupMediaRoutes = (router) => {
    const mediaController = container_1.container.resolve(media_controller_1.MediaController);
    const auth = (0, auth_middleware_1.authMiddleware)();
    router.post('/media/add', auth, (0, validation_middleware_1.validate)(media_validator_1.createMediaSchema), (0, async_handler_1.asyncHandler)(mediaController.create.bind(mediaController)));
    router.get('/media/all', auth, (0, async_handler_1.asyncHandler)(mediaController.getAll.bind(mediaController)));
    router.get('/media/:id', auth, (0, async_handler_1.asyncHandler)(mediaController.getById.bind(mediaController)));
    router.patch('/media/:id', auth, (0, validation_middleware_1.validate)(media_validator_1.updateMediaSchema), (0, async_handler_1.asyncHandler)(mediaController.update.bind(mediaController)));
    router.delete('/media/:id', auth, (0, async_handler_1.asyncHandler)(mediaController.delete.bind(mediaController)));
};
exports.setupMediaRoutes = setupMediaRoutes;

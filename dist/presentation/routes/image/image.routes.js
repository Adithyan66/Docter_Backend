"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupImageRoutes = void 0;
const image_service_controller_1 = require("../../controllers/image-service.controller");
const async_handler_1 = require("../../utils/async-handler");
const container_1 = require("../../../di/container");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const setupImageRoutes = (router) => {
    const imageServiceController = container_1.container.resolve(image_service_controller_1.ImageServiceController);
    const auth = (0, auth_middleware_1.authMiddleware)();
    router.post('/image-upload/:type', auth, (0, async_handler_1.asyncHandler)(imageServiceController.generateUploadUrl.bind(imageServiceController)));
    router.get('/image-download', auth, (0, async_handler_1.asyncHandler)(imageServiceController.generateDownloadUrl.bind(imageServiceController)));
};
exports.setupImageRoutes = setupImageRoutes;

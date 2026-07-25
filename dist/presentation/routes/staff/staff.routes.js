"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupStaffRoutes = void 0;
const staff_controller_1 = require("../../controllers/staff.controller");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const staff_validator_1 = require("../../validators/staff.validator");
const async_handler_1 = require("../../utils/async-handler");
const setupStaffRoutes = (router, resolver) => {
    const staffController = resolver.resolve(staff_controller_1.StaffController);
    const auth = (0, auth_middleware_1.authMiddleware)(resolver);
    router.post('/staff', auth, role_middleware_1.doctorOnly, (0, validation_middleware_1.validate)(staff_validator_1.createStaffSchema), (0, async_handler_1.asyncHandler)(staffController.create.bind(staffController)));
    router.patch('/staff/:id', auth, role_middleware_1.doctorOnly, (0, validation_middleware_1.validate)(staff_validator_1.updateStaffSchema), (0, async_handler_1.asyncHandler)(staffController.update.bind(staffController)));
    router.delete('/staff/:id', auth, role_middleware_1.doctorOnly, (0, async_handler_1.asyncHandler)(staffController.delete.bind(staffController)));
    router.get('/staff/:id', auth, role_middleware_1.doctorOnly, (0, async_handler_1.asyncHandler)(staffController.getById.bind(staffController)));
    router.get('/staff', auth, role_middleware_1.doctorOnly, (0, async_handler_1.asyncHandler)(staffController.getAll.bind(staffController)));
};
exports.setupStaffRoutes = setupStaffRoutes;

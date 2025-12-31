"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPrescriptionRoutes = void 0;
const prescription_controller_1 = require("../../controllers/prescription.controller");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const prescription_validator_1 = require("../../validators/prescription.validator");
const async_handler_1 = require("../../utils/async-handler");
const container_1 = require("../../../di/container");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const setupPrescriptionRoutes = (router) => {
    const prescriptionController = container_1.container.resolve(prescription_controller_1.PrescriptionController);
    const auth = (0, auth_middleware_1.authMiddleware)();
    router.post('/prescription/add', auth, (0, validation_middleware_1.validate)(prescription_validator_1.createPrescriptionSchema), (0, async_handler_1.asyncHandler)(prescriptionController.create.bind(prescriptionController)));
    router.get('/prescription/all', auth, (0, async_handler_1.asyncHandler)(prescriptionController.getAll.bind(prescriptionController)));
    router.get('/prescription/:id', auth, (0, async_handler_1.asyncHandler)(prescriptionController.getById.bind(prescriptionController)));
    router.patch('/prescription/:id', auth, (0, validation_middleware_1.validate)(prescription_validator_1.updatePrescriptionSchema), (0, async_handler_1.asyncHandler)(prescriptionController.update.bind(prescriptionController)));
    router.delete('/prescription/:id', auth, (0, async_handler_1.asyncHandler)(prescriptionController.delete.bind(prescriptionController)));
};
exports.setupPrescriptionRoutes = setupPrescriptionRoutes;

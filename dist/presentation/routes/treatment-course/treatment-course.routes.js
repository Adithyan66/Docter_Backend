"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTreatmentCourseRoutes = void 0;
const treatment_course_controller_1 = require("../../controllers/treatment-course.controller");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const treatment_course_validator_1 = require("../../validators/treatment-course.validator");
const async_handler_1 = require("../../utils/async-handler");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const setupTreatmentCourseRoutes = (router, resolver) => {
    const treatmentCourseController = resolver.resolve(treatment_course_controller_1.TreatmentCourseController);
    const auth = (0, auth_middleware_1.authMiddleware)(resolver);
    router.post('/treatment-course/add', auth, role_middleware_1.doctorOnly, (0, validation_middleware_1.validate)(treatment_course_validator_1.createTreatmentCourseSchema), (0, async_handler_1.asyncHandler)(treatmentCourseController.create.bind(treatmentCourseController)));
    router.get('/treatment-course/all', auth, (0, async_handler_1.asyncHandler)(treatmentCourseController.getAll.bind(treatmentCourseController)));
    router.get('/treatment-course/:id', auth, (0, async_handler_1.asyncHandler)(treatmentCourseController.getById.bind(treatmentCourseController)));
    router.patch('/treatment-course/:id', auth, (0, validation_middleware_1.validate)(treatment_course_validator_1.updateTreatmentCourseSchema), (0, async_handler_1.asyncHandler)(treatmentCourseController.update.bind(treatmentCourseController)));
    router.delete('/treatment-course/:id', auth, role_middleware_1.doctorOnly, (0, async_handler_1.asyncHandler)(treatmentCourseController.delete.bind(treatmentCourseController)));
};
exports.setupTreatmentCourseRoutes = setupTreatmentCourseRoutes;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPaymentRoutes = void 0;
const payment_controller_1 = require("../../controllers/payment.controller");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const payment_validator_1 = require("../../validators/payment.validator");
const async_handler_1 = require("../../utils/async-handler");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const setupPaymentRoutes = (router, resolver) => {
    const paymentController = resolver.resolve(payment_controller_1.PaymentController);
    const auth = (0, auth_middleware_1.authMiddleware)(resolver);
    router.post('/payment/add', auth, (0, validation_middleware_1.validate)(payment_validator_1.createPaymentSchema), (0, async_handler_1.asyncHandler)(paymentController.create.bind(paymentController)));
    router.get('/payment/all', auth, (0, async_handler_1.asyncHandler)(paymentController.getAll.bind(paymentController)));
    router.get('/payment/:id', auth, (0, async_handler_1.asyncHandler)(paymentController.getById.bind(paymentController)));
    router.post('/payment/:id/refund', auth, (0, validation_middleware_1.validate)(payment_validator_1.refundPaymentSchema), (0, async_handler_1.asyncHandler)(paymentController.refund.bind(paymentController)));
};
exports.setupPaymentRoutes = setupPaymentRoutes;

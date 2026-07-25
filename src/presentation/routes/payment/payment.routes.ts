import { DependencyContainer } from 'tsyringe';
import { Router } from '../../interfaces';
import { PaymentController } from '../../controllers/payment.controller';
import { validate } from '../../middleware/validation.middleware';
import { createPaymentSchema, refundPaymentSchema } from '../../validators/payment.validator';
import { asyncHandler } from '../../utils/async-handler';
import { authMiddleware } from '../../middleware/auth.middleware';

export const setupPaymentRoutes = (router: Router, resolver: DependencyContainer): void => {
  const paymentController = resolver.resolve(PaymentController);
  const auth = authMiddleware(resolver);

  router.post('/payment/add', auth, validate(createPaymentSchema), asyncHandler(paymentController.create.bind(paymentController)));

  router.get('/payment/all', auth, asyncHandler(paymentController.getAll.bind(paymentController)));

  router.get('/payment/:id', auth, asyncHandler(paymentController.getById.bind(paymentController)));

  router.post('/payment/:id/refund', auth, validate(refundPaymentSchema), asyncHandler(paymentController.refund.bind(paymentController)));
};


import { z } from 'zod';

const MIN_AMOUNT = 0.01;
const MAX_AMOUNT = 10000000;

export const createPaymentSchema = z.object({
  courseId: z.string().min(1, 'courseId is required'),
  patientId: z.string().min(1, 'patientId is required'),
  amount: z
    .number()
    .min(MIN_AMOUNT, `amount must be at least ${MIN_AMOUNT}`)
    .max(MAX_AMOUNT, `amount must not exceed ${MAX_AMOUNT}`),
  method: z.enum(['cash', 'card', 'upi', 'bank', 'insurance', 'online'], {
    message: 'method must be one of: cash, card, upi, bank, insurance, online',
  }),
  reference: z.string().optional(),
  visitId: z.string().optional(),
  clinicId: z.string().optional(),
  paidAt: z.string().datetime().optional(),
});

export const refundPaymentSchema = z.object({
  refundReason: z.string().optional(),
  refundAmount: z
    .number()
    .min(MIN_AMOUNT, `refundAmount must be at least ${MIN_AMOUNT}`)
    .max(MAX_AMOUNT, `refundAmount must not exceed ${MAX_AMOUNT}`)
    .optional(),
});


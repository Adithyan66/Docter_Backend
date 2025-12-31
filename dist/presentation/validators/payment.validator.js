"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundPaymentSchema = exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
const MIN_AMOUNT = 0.01;
const MAX_AMOUNT = 10000000;
exports.createPaymentSchema = zod_1.z.object({
    courseId: zod_1.z.string().min(1, 'courseId is required'),
    patientId: zod_1.z.string().min(1, 'patientId is required'),
    amount: zod_1.z
        .number()
        .min(MIN_AMOUNT, `amount must be at least ${MIN_AMOUNT}`)
        .max(MAX_AMOUNT, `amount must not exceed ${MAX_AMOUNT}`),
    method: zod_1.z.enum(['cash', 'card', 'upi', 'bank', 'insurance', 'online'], {
        message: 'method must be one of: cash, card, upi, bank, insurance, online',
    }),
    reference: zod_1.z.string().optional(),
    visitId: zod_1.z.string().optional(),
    clinicId: zod_1.z.string().optional(),
    paidAt: zod_1.z.string().datetime().optional(),
});
exports.refundPaymentSchema = zod_1.z.object({
    refundReason: zod_1.z.string().optional(),
    refundAmount: zod_1.z
        .number()
        .min(MIN_AMOUNT, `refundAmount must be at least ${MIN_AMOUNT}`)
        .max(MAX_AMOUNT, `refundAmount must not exceed ${MAX_AMOUNT}`)
        .optional(),
});

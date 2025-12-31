"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTreatmentCourseSchema = exports.createTreatmentCourseSchema = void 0;
const zod_1 = require("zod");
const statuses = ['active', 'paused', 'completed', 'cancelled'];
exports.createTreatmentCourseSchema = zod_1.z
    .object({
    patientId: zod_1.z.string().trim().min(1, 'patientId is required'),
    clinicId: zod_1.z.string().trim().min(1).optional(),
    treatmentId: zod_1.z.string().trim().min(1, 'treatmentId is required'),
    startDate: zod_1.z.string().datetime('Invalid startDate format'),
    expectedEndDate: zod_1.z.string().datetime('Invalid expectedEndDate format').optional(),
    lastVisitDate: zod_1.z.string().datetime('Invalid lastVisitDate format').optional(),
    nextVisitDate: zod_1.z
        .string()
        .datetime('Invalid nextVisitDate format')
        .optional()
        .refine((val) => {
        if (!val)
            return true;
        const date = new Date(val);
        return date > new Date();
    }, { message: 'nextVisitDate must be in the future' }),
    totalCost: zod_1.z.number().min(0, 'totalCost must be non-negative'),
    totalPaid: zod_1.z.number().min(0, 'totalPaid must be non-negative').optional(),
    status: zod_1.z.enum(statuses).optional(),
    notes: zod_1.z.string().trim().optional(),
    visits: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
    payments: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
})
    .refine((data) => {
    if (data.lastVisitDate && data.nextVisitDate) {
        return new Date(data.nextVisitDate) > new Date(data.lastVisitDate);
    }
    return true;
}, {
    message: 'nextVisitDate must be after lastVisitDate',
    path: ['nextVisitDate'],
});
exports.updateTreatmentCourseSchema = zod_1.z
    .object({
    patientId: zod_1.z.string().trim().min(1).optional(),
    clinicId: zod_1.z.string().trim().min(1).optional().nullable(),
    treatmentId: zod_1.z.string().trim().min(1).optional(),
    startDate: zod_1.z.string().datetime('Invalid startDate format').optional(),
    expectedEndDate: zod_1.z.string().datetime('Invalid expectedEndDate format').optional().nullable(),
    lastVisitDate: zod_1.z.string().datetime('Invalid lastVisitDate format').optional().nullable(),
    nextVisitDate: zod_1.z
        .string()
        .datetime('Invalid nextVisitDate format')
        .optional()
        .nullable()
        .refine((val) => {
        if (!val)
            return true;
        const date = new Date(val);
        return date > new Date();
    }, { message: 'nextVisitDate must be in the future' }),
    totalCost: zod_1.z.number().min(0, 'totalCost must be non-negative').optional(),
    totalPaid: zod_1.z.number().min(0, 'totalPaid must be non-negative').optional(),
    isPaymentCompleted: zod_1.z.boolean().optional(),
    isMedicallyCompleted: zod_1.z.boolean().optional(),
    status: zod_1.z.enum(statuses).optional(),
    notes: zod_1.z.string().trim().optional().nullable(),
    visits: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
    payments: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
})
    .refine((data) => {
    if (data.lastVisitDate && data.nextVisitDate) {
        return new Date(data.nextVisitDate) > new Date(data.lastVisitDate);
    }
    return true;
}, {
    message: 'nextVisitDate must be after lastVisitDate',
    path: ['nextVisitDate'],
});

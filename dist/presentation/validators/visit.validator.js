"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVisitSchema = exports.createVisitSchema = void 0;
const zod_1 = require("zod");
const prescriptionItemSchema = zod_1.z.object({
    medicineName: zod_1.z.string().trim().min(1, 'medicineName is required'),
    form: zod_1.z.string().trim().optional(),
    strength: zod_1.z.string().trim().optional(),
    dosage: zod_1.z.string().trim().optional(),
    frequency: zod_1.z.string().trim().optional(),
    duration: zod_1.z.string().trim().optional(),
    notes: zod_1.z.string().trim().optional(),
});
const visitPrescriptionSchema = zod_1.z.object({
    clinicId: zod_1.z.string().trim().min(1).optional(),
    diagnosis: zod_1.z.array(zod_1.z.string()).optional(),
    items: zod_1.z.array(prescriptionItemSchema).min(1, 'At least one prescription item is required'),
    notes: zod_1.z.string().trim().optional(),
});
const mediaTypes = ['image', 'xray', 'report', 'other'];
const visitMediaSchema = zod_1.z.object({
    url: zod_1.z.string().url('Invalid URL format').trim().min(1, 'URL is required'),
    filename: zod_1.z.string().trim().optional(),
    mimeType: zod_1.z.string().trim().optional(),
    size: zod_1.z.number().min(0, 'Size cannot be negative').optional(),
    type: zod_1.z.enum(mediaTypes).optional(),
    notes: zod_1.z.string().trim().optional(),
});
exports.createVisitSchema = zod_1.z
    .object({
    patientId: zod_1.z.string().trim().min(1, 'patientId is required'),
    courseId: zod_1.z.string().trim().min(1, 'courseId is required'),
    clinicId: zod_1.z.string().trim().min(1).optional(),
    notes: zod_1.z.string().trim().optional(),
    billedAmount: zod_1.z.number().min(0, 'billedAmount must be non-negative').optional(),
    visitDate: zod_1.z.string().datetime('Invalid visitDate format').optional(),
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
    paymentMethod: zod_1.z.enum(['cash', 'card', 'upi', 'bank', 'insurance', 'online']).optional(),
    paymentReference: zod_1.z.string().trim().optional(),
    mediaIds: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
    prescriptionId: zod_1.z.string().trim().min(1).optional(),
    prescription: visitPrescriptionSchema.optional(),
    media: zod_1.z.array(visitMediaSchema).optional(),
})
    .refine((data) => {
    if (data.visitDate && data.nextVisitDate) {
        return new Date(data.nextVisitDate) > new Date(data.visitDate);
    }
    return true;
}, {
    message: 'nextVisitDate must be after visitDate',
    path: ['nextVisitDate'],
});
exports.updateVisitSchema = zod_1.z.object({
    patientId: zod_1.z.string().trim().min(1).optional(),
    courseId: zod_1.z.string().trim().min(1).optional(),
    clinicId: zod_1.z.string().trim().min(1).optional().nullable(),
    notes: zod_1.z.string().trim().optional().nullable(),
    billedAmount: zod_1.z.number().min(0, 'billedAmount must be non-negative').optional(),
    mediaIds: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
    prescriptionId: zod_1.z.string().trim().min(1).optional().nullable(),
});

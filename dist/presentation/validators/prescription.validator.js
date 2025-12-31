"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePrescriptionSchema = exports.createPrescriptionSchema = void 0;
const zod_1 = require("zod");
const prescriptionItemSchema = zod_1.z.object({
    medicineName: zod_1.z.string().min(1, 'medicineName is required'),
    form: zod_1.z.string().optional(),
    strength: zod_1.z.string().optional(),
    dosage: zod_1.z.string().optional(),
    frequency: zod_1.z.string().optional(),
    duration: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.createPrescriptionSchema = zod_1.z.object({
    patientId: zod_1.z.string().min(1, 'patientId is required'),
    visitId: zod_1.z.string().min(1, 'visitId is required'),
    clinicId: zod_1.z.string().optional(),
    diagnosis: zod_1.z.array(zod_1.z.string()).optional(),
    items: zod_1.z.array(prescriptionItemSchema).min(1, 'At least one prescription item is required'),
    notes: zod_1.z.string().optional(),
});
exports.updatePrescriptionSchema = zod_1.z.object({
    visitId: zod_1.z.string().min(1).optional(),
    clinicId: zod_1.z.string().optional(),
    diagnosis: zod_1.z.array(zod_1.z.string()).optional(),
    items: zod_1.z.array(prescriptionItemSchema).min(1, 'At least one prescription item is required').optional(),
    notes: zod_1.z.string().optional(),
});

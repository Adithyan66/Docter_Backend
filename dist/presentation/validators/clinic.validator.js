"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addClinicImagesSchema = exports.updateClinicSchema = exports.createClinicSchema = void 0;
const zod_1 = require("zod");
const dayOfWeekEnum = zod_1.z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
const workingDaySchema = zod_1.z.object({
    day: dayOfWeekEnum,
    startTime: zod_1.z.string().regex(timeRegex, 'Invalid start time format. Expected HH:mm format'),
    endTime: zod_1.z.string().regex(timeRegex, 'Invalid end time format. Expected HH:mm format'),
});
exports.createClinicSchema = zod_1.z.object({
    clinicId: zod_1.z.string()
        .min(1, 'clinicId is required')
        .regex(/^[A-Z]{3}$/, 'clinicId must be exactly 3 capital letters')
        .transform(val => val.toUpperCase()),
    name: zod_1.z.string().min(1, 'Name is required'),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    pincode: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.union([zod_1.z.string().email('Invalid email format'), zod_1.z.literal('')]).optional().transform(val => val === '' ? undefined : val),
    website: zod_1.z.union([zod_1.z.string().url('Invalid website URL format'), zod_1.z.literal('')]).optional().transform(val => val === '' ? undefined : val),
    locationUrl: zod_1.z.union([zod_1.z.string().url('Invalid location URL format'), zod_1.z.literal('')]).optional().transform(val => val === '' ? undefined : val),
    workingDays: zod_1.z.array(workingDaySchema).optional(),
    treatments: zod_1.z.array(zod_1.z.string()).optional(),
    images: zod_1.z.array(zod_1.z.string().url('Invalid image URL format')).optional(),
    notes: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.updateClinicSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name cannot be empty').optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    pincode: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.union([zod_1.z.string().email('Invalid email format'), zod_1.z.literal('')]).optional().transform(val => val === '' ? undefined : val),
    website: zod_1.z.union([zod_1.z.string().url('Invalid website URL format'), zod_1.z.literal('')]).optional().transform(val => val === '' ? undefined : val),
    locationUrl: zod_1.z.union([zod_1.z.string().url('Invalid location URL format'), zod_1.z.literal('')]).optional().transform(val => val === '' ? undefined : val),
    workingDays: zod_1.z.array(workingDaySchema).optional(),
    treatments: zod_1.z.array(zod_1.z.string()).optional(),
    images: zod_1.z.array(zod_1.z.string().url('Invalid image URL format')).optional(),
    notes: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.addClinicImagesSchema = zod_1.z.object({
    images: zod_1.z.array(zod_1.z.string().url('Invalid image URL format')).min(1, 'At least one image URL is required'),
});

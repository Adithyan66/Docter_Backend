"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTreatmentImagesSchema = exports.updateTreatmentSchema = exports.createTreatmentSchema = void 0;
const zod_1 = require("zod");
const MIN_DURATION_MONTHS = 0;
const MAX_DURATION_MONTHS = 120;
const MIN_FEES = 0;
const MAX_FEES = 1000000;
exports.createTreatmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    description: zod_1.z.string().optional(),
    minDuration: zod_1.z.number().min(MIN_DURATION_MONTHS, `minDuration must be at least ${MIN_DURATION_MONTHS} months`).max(MAX_DURATION_MONTHS, `minDuration must not exceed ${MAX_DURATION_MONTHS} months`).optional(),
    maxDuration: zod_1.z.number().min(MIN_DURATION_MONTHS, `maxDuration must be at least ${MIN_DURATION_MONTHS} months`).max(MAX_DURATION_MONTHS, `maxDuration must not exceed ${MAX_DURATION_MONTHS} months`).optional(),
    avgDuration: zod_1.z.number().min(MIN_DURATION_MONTHS, `avgDuration must be at least ${MIN_DURATION_MONTHS} months`).max(MAX_DURATION_MONTHS, `avgDuration must not exceed ${MAX_DURATION_MONTHS} months`).optional(),
    minFees: zod_1.z.number().min(MIN_FEES, `minFees must be at least ${MIN_FEES}`).max(MAX_FEES, `minFees must not exceed ${MAX_FEES} (10 lakh)`).optional(),
    maxFees: zod_1.z.number().min(MIN_FEES, `maxFees must be at least ${MIN_FEES}`).max(MAX_FEES, `maxFees must not exceed ${MAX_FEES} (10 lakh)`).optional(),
    avgFees: zod_1.z.number().min(MIN_FEES, `avgFees must be at least ${MIN_FEES}`).max(MAX_FEES, `avgFees must not exceed ${MAX_FEES} (10 lakh)`).optional(),
    steps: zod_1.z.array(zod_1.z.string()).optional(),
    aftercare: zod_1.z.array(zod_1.z.string()).optional(),
    followUpRequired: zod_1.z.boolean().optional(),
    followUpAfterDays: zod_1.z.number().int().positive().optional(),
    risks: zod_1.z.array(zod_1.z.string()).optional(),
    images: zod_1.z.array(zod_1.z.string().url()).optional(),
    isOneTime: zod_1.z.boolean().optional(),
    regularVisitInterval: zod_1.z.object({
        interval: zod_1.z.number().positive('regularVisitInterval.interval must be a positive number'),
        unit: zod_1.z.enum(['days', 'weeks', 'months', 'years'], {
            message: 'regularVisitInterval.unit must be one of: days, weeks, months, years',
        }),
    }).optional().nullable(),
}).refine((data) => {
    if (data.minDuration !== undefined && data.maxDuration !== undefined) {
        return data.minDuration <= data.maxDuration;
    }
    return true;
}, {
    message: 'minDuration must be less than or equal to maxDuration',
    path: ['minDuration'],
}).refine((data) => {
    if (data.minFees !== undefined && data.maxFees !== undefined) {
        return data.minFees <= data.maxFees;
    }
    return true;
}, {
    message: 'minFees must be less than or equal to maxFees',
    path: ['minFees'],
}).refine((data) => {
    if (data.avgDuration !== undefined) {
        if (data.minDuration !== undefined && data.avgDuration < data.minDuration) {
            return false;
        }
        if (data.maxDuration !== undefined && data.avgDuration > data.maxDuration) {
            return false;
        }
    }
    return true;
}, {
    message: 'avgDuration must be between minDuration and maxDuration',
    path: ['avgDuration'],
}).refine((data) => {
    if (data.avgFees !== undefined) {
        if (data.minFees !== undefined && data.avgFees < data.minFees) {
            return false;
        }
        if (data.maxFees !== undefined && data.avgFees > data.maxFees) {
            return false;
        }
    }
    return true;
}, {
    message: 'avgFees must be between minFees and maxFees',
    path: ['avgFees'],
}).refine((data) => {
    if (data.isOneTime === true && data.regularVisitInterval !== undefined && data.regularVisitInterval !== null) {
        return false;
    }
    return true;
}, {
    message: 'Cannot set regularVisitInterval when isOneTime is true',
    path: ['regularVisitInterval'],
});
exports.updateTreatmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name cannot be empty').optional(),
    description: zod_1.z.string().optional(),
    minDuration: zod_1.z.number().min(MIN_DURATION_MONTHS, `minDuration must be at least ${MIN_DURATION_MONTHS} months`).max(MAX_DURATION_MONTHS, `minDuration must not exceed ${MAX_DURATION_MONTHS} months`).optional(),
    maxDuration: zod_1.z.number().min(MIN_DURATION_MONTHS, `maxDuration must be at least ${MIN_DURATION_MONTHS} months`).max(MAX_DURATION_MONTHS, `maxDuration must not exceed ${MAX_DURATION_MONTHS} months`).optional(),
    avgDuration: zod_1.z.number().min(MIN_DURATION_MONTHS, `avgDuration must be at least ${MIN_DURATION_MONTHS} months`).max(MAX_DURATION_MONTHS, `avgDuration must not exceed ${MAX_DURATION_MONTHS} months`).optional(),
    minFees: zod_1.z.number().min(MIN_FEES, `minFees must be at least ${MIN_FEES}`).max(MAX_FEES, `minFees must not exceed ${MAX_FEES} (10 lakh)`).optional(),
    maxFees: zod_1.z.number().min(MIN_FEES, `maxFees must be at least ${MIN_FEES}`).max(MAX_FEES, `maxFees must not exceed ${MAX_FEES} (10 lakh)`).optional(),
    avgFees: zod_1.z.number().min(MIN_FEES, `avgFees must be at least ${MIN_FEES}`).max(MAX_FEES, `avgFees must not exceed ${MAX_FEES} (10 lakh)`).optional(),
    steps: zod_1.z.array(zod_1.z.string()).optional(),
    aftercare: zod_1.z.array(zod_1.z.string()).optional(),
    followUpRequired: zod_1.z.boolean().optional(),
    followUpAfterDays: zod_1.z.number().int().positive().optional(),
    risks: zod_1.z.array(zod_1.z.string()).optional(),
    images: zod_1.z.array(zod_1.z.string().url()).optional(),
    isOneTime: zod_1.z.boolean().optional(),
    regularVisitInterval: zod_1.z.object({
        interval: zod_1.z.number().positive('regularVisitInterval.interval must be a positive number'),
        unit: zod_1.z.enum(['days', 'weeks', 'months', 'years'], {
            message: 'regularVisitInterval.unit must be one of: days, weeks, months, years',
        }),
    }).optional().nullable(),
}).refine((data) => {
    if (data.isOneTime === true && data.regularVisitInterval !== undefined && data.regularVisitInterval !== null) {
        return false;
    }
    return true;
}, {
    message: 'Cannot set regularVisitInterval when isOneTime is true',
    path: ['regularVisitInterval'],
});
exports.addTreatmentImagesSchema = zod_1.z.object({
    images: zod_1.z.array(zod_1.z.string().url('Invalid image URL format')).min(1, 'At least one image URL is required'),
});

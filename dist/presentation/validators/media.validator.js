"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMediaSchema = exports.createMediaSchema = void 0;
const zod_1 = require("zod");
const mediaTypes = ['image', 'xray', 'report', 'other'];
exports.createMediaSchema = zod_1.z.object({
    patientId: zod_1.z.string().trim().min(1).optional(),
    courseId: zod_1.z.string().trim().min(1).optional(),
    visitId: zod_1.z.string().trim().min(1).optional(),
    clinicId: zod_1.z.string().trim().min(1).optional(),
    url: zod_1.z.string().url('Invalid URL format').trim().min(1, 'URL is required'),
    filename: zod_1.z.string().trim().optional(),
    mimeType: zod_1.z.string().trim().optional(),
    size: zod_1.z.number().min(0, 'Size cannot be negative').optional(),
    type: zod_1.z.enum(mediaTypes).optional(),
    notes: zod_1.z.string().trim().optional(),
});
exports.updateMediaSchema = zod_1.z.object({
    patientId: zod_1.z.string().trim().min(1).optional(),
    courseId: zod_1.z.string().trim().min(1).optional(),
    visitId: zod_1.z.string().trim().min(1).optional(),
    clinicId: zod_1.z.string().trim().min(1).optional(),
    url: zod_1.z.string().url('Invalid URL format').trim().min(1).optional(),
    filename: zod_1.z.string().trim().optional(),
    mimeType: zod_1.z.string().trim().optional(),
    size: zod_1.z.number().min(0, 'Size cannot be negative').optional(),
    type: zod_1.z.enum(mediaTypes).optional(),
    notes: zod_1.z.string().trim().optional(),
});

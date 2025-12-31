"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStaffSchema = exports.createStaffSchema = void 0;
const zod_1 = require("zod");
exports.createStaffSchema = zod_1.z
    .object({
    username: zod_1.z.string().min(1, 'username is required'),
    password: zod_1.z.string().min(6, 'password must be at least 6 characters'),
    clinicId: zod_1.z.string().min(1, 'clinicId is required'),
})
    .strict();
exports.updateStaffSchema = zod_1.z
    .object({
    username: zod_1.z.string().min(1, 'username cannot be empty').optional(),
    password: zod_1.z.string().min(6, 'password must be at least 6 characters').optional(),
    clinicId: zod_1.z.string().min(1, 'clinicId cannot be empty').optional(),
    isActive: zod_1.z.boolean().optional(),
})
    .strict();

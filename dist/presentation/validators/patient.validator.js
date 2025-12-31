"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePatientSchema = exports.createPatientSchema = void 0;
const zod_1 = require("zod");
const genders = ['male', 'female', 'other', 'unknown'];
const consultationTypes = ['one-time', 'treatment-plan'];
const patientIdRegex = /^[A-Za-z]{3}-\d+$/;
const phoneRegex = /^\+?[0-9]{7,15}$/;
exports.createPatientSchema = zod_1.z.object({
    primaryClinic: zod_1.z.string().trim().min(1, 'primaryClinic is required'),
    clinics: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
    firstName: zod_1.z.string().trim().min(1, 'firstName is required'),
    lastName: zod_1.z.string().trim().optional(),
    fullName: zod_1.z.string().trim().optional(),
    dob: zod_1.z.string().datetime().optional(),
    age: zod_1.z.number().min(0, 'age cannot be negative').optional(),
    gender: zod_1.z.enum(genders).optional(),
    phone: zod_1.z.string().trim().regex(phoneRegex, 'Invalid phone number').optional(),
    email: zod_1.z.string().email('Invalid email').optional(),
    address: zod_1.z.string().trim().optional(),
    profilePicUrl: zod_1.z.string().url('Invalid profilePicUrl').nullable().optional(),
    consultationType: zod_1.z.enum(consultationTypes),
    tags: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
    visitCount: zod_1.z.number().min(0, 'visitCount cannot be negative').optional(),
    lastVisitAt: zod_1.z.string().datetime().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.updatePatientSchema = zod_1.z.object({
    primaryClinic: zod_1.z.string().trim().min(1).optional(),
    clinics: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
    patientId: zod_1.z
        .string()
        .trim()
        .regex(patientIdRegex, 'patientId must match pattern AAA-123')
        .optional(),
    firstName: zod_1.z.string().trim().min(1, 'firstName cannot be empty').optional(),
    lastName: zod_1.z.string().trim().optional(),
    fullName: zod_1.z.string().trim().optional(),
    dob: zod_1.z.string().datetime().optional(),
    age: zod_1.z.number().min(0, 'age cannot be negative').optional(),
    gender: zod_1.z.enum(genders).optional(),
    phone: zod_1.z.string().trim().regex(phoneRegex, 'Invalid phone number').optional(),
    email: zod_1.z.string().email('Invalid email').optional(),
    address: zod_1.z.string().trim().optional(),
    profilePicUrl: zod_1.z.string().url('Invalid profilePicUrl').nullable().optional(),
    consultationType: zod_1.z.enum(consultationTypes).optional(),
    tags: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
    visitCount: zod_1.z.number().min(0, 'visitCount cannot be negative').optional(),
    lastVisitAt: zod_1.z.string().datetime().optional(),
    isActive: zod_1.z.boolean().optional(),
    isDeleted: zod_1.z.boolean().optional(),
    defaultTreatmentCourse: zod_1.z.string().trim().min(1, 'defaultTreatmentCourse cannot be empty').optional(),
});

import { z } from 'zod';

const genders = ['male', 'female', 'other', 'unknown'] as const;
const consultationTypes = ['one-time', 'treatment-plan'] as const;
const patientIdRegex = /^[A-Za-z]{3}-\d+$/;
const phoneRegex = /^\+?[0-9]{7,15}$/;

export const createPatientSchema = z.object({
  primaryClinic: z.string().trim().min(1, 'primaryClinic is required'),
  clinics: z.array(z.string().trim().min(1)).optional(),
  firstName: z.string().trim().min(1, 'firstName is required'),
  lastName: z.string().trim().optional(),
  fullName: z.string().trim().optional(),
  dob: z.string().datetime().optional(),
  age: z.number().min(0, 'age cannot be negative').optional(),
  gender: z.enum(genders).optional(),
  phone: z.string().trim().regex(phoneRegex, 'Invalid phone number').optional(),
  email: z.string().email('Invalid email').optional(),
  address: z.string().trim().optional(),
  profilePicUrl: z.string().url('Invalid profilePicUrl').optional(),
  consultationType: z.enum(consultationTypes),
  tags: z.array(z.string().trim().min(1)).optional(),
  visitCount: z.number().min(0, 'visitCount cannot be negative').optional(),
  lastVisitAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export const updatePatientSchema = z.object({
  primaryClinic: z.string().trim().min(1).optional(),
  clinics: z.array(z.string().trim().min(1)).optional(),
  patientId: z
    .string()
    .trim()
    .regex(patientIdRegex, 'patientId must match pattern AAA-123')
    .optional(),
  firstName: z.string().trim().min(1, 'firstName cannot be empty').optional(),
  lastName: z.string().trim().optional(),
  fullName: z.string().trim().optional(),
  dob: z.string().datetime().optional(),
  age: z.number().min(0, 'age cannot be negative').optional(),
  gender: z.enum(genders).optional(),
  phone: z.string().trim().regex(phoneRegex, 'Invalid phone number').optional(),
  email: z.string().email('Invalid email').optional(),
  address: z.string().trim().optional(),
  profilePicUrl: z.string().url('Invalid profilePicUrl').optional(),
  consultationType: z.enum(consultationTypes).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  visitCount: z.number().min(0, 'visitCount cannot be negative').optional(),
  lastVisitAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
});



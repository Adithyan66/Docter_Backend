import { z } from 'zod';

const dayOfWeekEnum = z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);

const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

const workingDaySchema = z.object({
  day: dayOfWeekEnum,
  startTime: z.string().regex(timeRegex, 'Invalid start time format. Expected HH:mm format'),
  endTime: z.string().regex(timeRegex, 'Invalid end time format. Expected HH:mm format'),
});

export const createClinicSchema = z.object({
  clinicId: z.string()
    .min(1, 'clinicId is required')
    .regex(/^[A-Z]{3}$/, 'clinicId must be exactly 3 capital letters')
    .transform(val => val.toUpperCase()),
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.string().email('Invalid email format'), z.literal('')]).optional().transform(val => val === '' ? undefined : val),
  website: z.union([z.string().url('Invalid website URL format'), z.literal('')]).optional().transform(val => val === '' ? undefined : val),
  locationUrl: z.union([z.string().url('Invalid location URL format'), z.literal('')]).optional().transform(val => val === '' ? undefined : val),
  workingDays: z.array(workingDaySchema).optional(),
  treatments: z.array(z.string()).optional(),
  images: z.array(z.string().url('Invalid image URL format')).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateClinicSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.string().email('Invalid email format'), z.literal('')]).optional().transform(val => val === '' ? undefined : val),
  website: z.union([z.string().url('Invalid website URL format'), z.literal('')]).optional().transform(val => val === '' ? undefined : val),
  locationUrl: z.union([z.string().url('Invalid location URL format'), z.literal('')]).optional().transform(val => val === '' ? undefined : val),
  workingDays: z.array(workingDaySchema).optional(),
  treatments: z.array(z.string()).optional(),
  images: z.array(z.string().url('Invalid image URL format')).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});


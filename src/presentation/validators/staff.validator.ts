import { z } from 'zod';

export const createStaffSchema = z
  .object({
    username: z.string().min(1, 'username is required'),
    password: z.string().min(6, 'password must be at least 6 characters'),
    clinicId: z.string().min(1, 'clinicId is required'),
  })
  .strict();

export const updateStaffSchema = z
  .object({
    username: z.string().min(1, 'username cannot be empty').optional(),
    password: z.string().min(6, 'password must be at least 6 characters').optional(),
    clinicId: z.string().min(1, 'clinicId cannot be empty').optional(),
    isActive: z.boolean().optional(),
  })
  .strict();



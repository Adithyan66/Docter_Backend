import { z } from 'zod';

export const createVisitSchema = z.object({
  patientId: z.string().trim().min(1, 'patientId is required'),
  courseId: z.string().trim().min(1, 'courseId is required'),
  clinicId: z.string().trim().min(1).optional(),
  notes: z.string().trim().optional(),
  billedAmount: z.number().min(0, 'billedAmount must be non-negative').optional(),
  mediaIds: z.array(z.string().trim().min(1)).optional(),
  prescriptionId: z.string().trim().min(1).optional(),
});

export const updateVisitSchema = z.object({
  patientId: z.string().trim().min(1).optional(),
  courseId: z.string().trim().min(1).optional(),
  clinicId: z.string().trim().min(1).optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  billedAmount: z.number().min(0, 'billedAmount must be non-negative').optional(),
  mediaIds: z.array(z.string().trim().min(1)).optional(),
  prescriptionId: z.string().trim().min(1).optional().nullable(),
});


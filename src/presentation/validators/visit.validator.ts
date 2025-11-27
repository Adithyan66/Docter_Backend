import { z } from 'zod';

const prescriptionItemSchema = z.object({
  medicineName: z.string().trim().min(1, 'medicineName is required'),
  form: z.string().trim().optional(),
  strength: z.string().trim().optional(),
  dosage: z.string().trim().optional(),
  frequency: z.string().trim().optional(),
  duration: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const visitPrescriptionSchema = z.object({
  clinicId: z.string().trim().min(1).optional(),
  diagnosis: z.array(z.string()).optional(),
  items: z.array(prescriptionItemSchema).min(1, 'At least one prescription item is required'),
  notes: z.string().trim().optional(),
});

const mediaTypes = ['image', 'xray', 'report', 'other'] as const;

const visitMediaSchema = z.object({
  url: z.string().url('Invalid URL format').trim().min(1, 'URL is required'),
  filename: z.string().trim().optional(),
  mimeType: z.string().trim().optional(),
  size: z.number().min(0, 'Size cannot be negative').optional(),
  type: z.enum(mediaTypes).optional(),
  notes: z.string().trim().optional(),
});

export const createVisitSchema = z.object({
  patientId: z.string().trim().min(1, 'patientId is required'),
  courseId: z.string().trim().min(1, 'courseId is required'),
  clinicId: z.string().trim().min(1).optional(),
  notes: z.string().trim().optional(),
  billedAmount: z.number().min(0, 'billedAmount must be non-negative').optional(),
  mediaIds: z.array(z.string().trim().min(1)).optional(),
  prescriptionId: z.string().trim().min(1).optional(),
  prescription: visitPrescriptionSchema.optional(),
  media: z.array(visitMediaSchema).optional(),
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


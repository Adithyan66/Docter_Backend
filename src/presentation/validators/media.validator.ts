import { z } from 'zod';

const mediaTypes = ['image', 'xray', 'report', 'other'] as const;

export const createMediaSchema = z.object({
  patientId: z.string().trim().min(1).optional(),
  courseId: z.string().trim().min(1).optional(),
  visitId: z.string().trim().min(1).optional(),
  clinicId: z.string().trim().min(1).optional(),
  url: z.string().url('Invalid URL format').trim().min(1, 'URL is required'),
  filename: z.string().trim().optional(),
  mimeType: z.string().trim().optional(),
  size: z.number().min(0, 'Size cannot be negative').optional(),
  type: z.enum(mediaTypes).optional(),
  notes: z.string().trim().optional(),
});

export const updateMediaSchema = z.object({
  patientId: z.string().trim().min(1).optional(),
  courseId: z.string().trim().min(1).optional(),
  visitId: z.string().trim().min(1).optional(),
  clinicId: z.string().trim().min(1).optional(),
  url: z.string().url('Invalid URL format').trim().min(1).optional(),
  filename: z.string().trim().optional(),
  mimeType: z.string().trim().optional(),
  size: z.number().min(0, 'Size cannot be negative').optional(),
  type: z.enum(mediaTypes).optional(),
  notes: z.string().trim().optional(),
});


import { z } from 'zod';

const prescriptionItemSchema = z.object({
  medicineName: z.string().min(1, 'medicineName is required'),
  form: z.string().optional(),
  strength: z.string().optional(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  notes: z.string().optional(),
});

export const createPrescriptionSchema = z.object({
  patientId: z.string().min(1, 'patientId is required'),
  visitId: z.string().min(1, 'visitId is required'),
  clinicId: z.string().optional(),
  diagnosis: z.array(z.string()).optional(),
  items: z.array(prescriptionItemSchema).min(1, 'At least one prescription item is required'),
  notes: z.string().optional(),
});

export const updatePrescriptionSchema = z.object({
  visitId: z.string().min(1).optional(),
  clinicId: z.string().optional(),
  diagnosis: z.array(z.string()).optional(),
  items: z.array(prescriptionItemSchema).min(1, 'At least one prescription item is required').optional(),
  notes: z.string().optional(),
});


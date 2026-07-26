import { z } from 'zod';

const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
// Anchored: the entry date is stored as a bare YYYY-MM-DD, so a full ISO
// timestamp would pass the validator and then be rejected by the use case.
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const appointmentSchema = z.object({
  patientId: z.string().min(1, 'patientId is required'),
  treatmentId: z.string().min(1, 'treatmentId cannot be empty').optional(),
  startTime: z.string().regex(timeRegex, 'Invalid startTime format. Expected HH:mm format').optional(),
  endTime: z.string().regex(timeRegex, 'Invalid endTime format. Expected HH:mm format').optional(),
  notes: z.string().optional(),
  completed: z.boolean().optional(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true;
}, {
  message: 'endTime must be after startTime',
  path: ['endTime'],
});

export const updateAppointmentSchema = z.object({
  treatmentId: z.string().min(1, 'treatmentId cannot be empty').optional(),
  startTime: z.string().regex(timeRegex, 'Invalid startTime format. Expected HH:mm format').optional(),
  endTime: z.string().regex(timeRegex, 'Invalid endTime format. Expected HH:mm format').optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true;
}, {
  message: 'endTime must be after startTime',
  path: ['endTime'],
});

export const createCalendarEntrySchema = z.object({
  date: z.string()
    .min(1, 'Date is required')
    .regex(dateRegex, 'Invalid date format. Expected YYYY-MM-DD format'),
  clinicId: z.string().min(1, 'clinicId is required'),
  startTime: z.string().regex(timeRegex, 'Invalid startTime format. Expected HH:mm format'),
  endTime: z.string().regex(timeRegex, 'Invalid endTime format. Expected HH:mm format'),
  notes: z.string().optional(),
  appointments: z.array(appointmentSchema).optional(),
}).refine((data) => data.endTime > data.startTime, {
  message: 'endTime must be after startTime',
  path: ['endTime'],
});

export const updateCalendarEntrySchema = z.object({
  date: z.string()
    .regex(dateRegex, 'Invalid date format. Expected YYYY-MM-DD format')
    .optional(),
  clinicId: z.string().min(1, 'clinicId cannot be empty').optional(),
  startTime: z.string().regex(timeRegex, 'Invalid startTime format. Expected HH:mm format').optional(),
  endTime: z.string().regex(timeRegex, 'Invalid endTime format. Expected HH:mm format').optional(),
  notes: z.string().optional(),
  appointments: z.array(appointmentSchema).min(1, 'At least one appointment is required').optional(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true;
}, {
  message: 'endTime must be after startTime',
  path: ['endTime'],
});


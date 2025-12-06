import { z } from 'zod';

const statuses = ['active', 'paused', 'completed', 'cancelled'] as const;

export const createTreatmentCourseSchema = z
  .object({
    patientId: z.string().trim().min(1, 'patientId is required'),
    clinicId: z.string().trim().min(1).optional(),
    treatmentId: z.string().trim().min(1, 'treatmentId is required'),
    startDate: z.string().datetime('Invalid startDate format'),
    expectedEndDate: z.string().datetime('Invalid expectedEndDate format').optional(),
    lastVisitDate: z.string().datetime('Invalid lastVisitDate format').optional(),
    nextVisitDate: z
      .string()
      .datetime('Invalid nextVisitDate format')
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const date = new Date(val);
          return date > new Date();
        },
        { message: 'nextVisitDate must be in the future' }
      ),
    totalCost: z.number().min(0, 'totalCost must be non-negative'),
    totalPaid: z.number().min(0, 'totalPaid must be non-negative').optional(),
    status: z.enum(statuses).optional(),
    notes: z.string().trim().optional(),
    visits: z.array(z.string().trim().min(1)).optional(),
    payments: z.array(z.string().trim().min(1)).optional(),
  })
  .refine(
    (data) => {
      if (data.lastVisitDate && data.nextVisitDate) {
        return new Date(data.nextVisitDate) > new Date(data.lastVisitDate);
      }
      return true;
    },
    {
      message: 'nextVisitDate must be after lastVisitDate',
      path: ['nextVisitDate'],
    }
  );

export const updateTreatmentCourseSchema = z
  .object({
    patientId: z.string().trim().min(1).optional(),
    clinicId: z.string().trim().min(1).optional().nullable(),
    treatmentId: z.string().trim().min(1).optional(),
    startDate: z.string().datetime('Invalid startDate format').optional(),
    expectedEndDate: z.string().datetime('Invalid expectedEndDate format').optional().nullable(),
    lastVisitDate: z.string().datetime('Invalid lastVisitDate format').optional().nullable(),
    nextVisitDate: z
      .string()
      .datetime('Invalid nextVisitDate format')
      .optional()
      .nullable()
      .refine(
        (val) => {
          if (!val) return true;
          const date = new Date(val);
          return date > new Date();
        },
        { message: 'nextVisitDate must be in the future' }
      ),
    totalCost: z.number().min(0, 'totalCost must be non-negative').optional(),
    totalPaid: z.number().min(0, 'totalPaid must be non-negative').optional(),
    isPaymentCompleted: z.boolean().optional(),
    isMedicallyCompleted: z.boolean().optional(),
    status: z.enum(statuses).optional(),
    notes: z.string().trim().optional().nullable(),
    visits: z.array(z.string().trim().min(1)).optional(),
    payments: z.array(z.string().trim().min(1)).optional(),
  })
  .refine(
    (data) => {
      if (data.lastVisitDate && data.nextVisitDate) {
        return new Date(data.nextVisitDate) > new Date(data.lastVisitDate);
      }
      return true;
    },
    {
      message: 'nextVisitDate must be after lastVisitDate',
      path: ['nextVisitDate'],
    }
  );


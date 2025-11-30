import { z } from 'zod';

const MIN_DURATION_MONTHS = 0;
const MAX_DURATION_MONTHS = 120;
const MIN_FEES = 0;
const MAX_FEES = 1000000;

export const createTreatmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  minDuration: z.number().min(MIN_DURATION_MONTHS, `minDuration must be at least ${MIN_DURATION_MONTHS} months`).max(MAX_DURATION_MONTHS, `minDuration must not exceed ${MAX_DURATION_MONTHS} months`).optional(),
  maxDuration: z.number().min(MIN_DURATION_MONTHS, `maxDuration must be at least ${MIN_DURATION_MONTHS} months`).max(MAX_DURATION_MONTHS, `maxDuration must not exceed ${MAX_DURATION_MONTHS} months`).optional(),
  avgDuration: z.number().min(MIN_DURATION_MONTHS, `avgDuration must be at least ${MIN_DURATION_MONTHS} months`).max(MAX_DURATION_MONTHS, `avgDuration must not exceed ${MAX_DURATION_MONTHS} months`).optional(),
  minFees: z.number().min(MIN_FEES, `minFees must be at least ${MIN_FEES}`).max(MAX_FEES, `minFees must not exceed ${MAX_FEES} (10 lakh)`).optional(),
  maxFees: z.number().min(MIN_FEES, `maxFees must be at least ${MIN_FEES}`).max(MAX_FEES, `maxFees must not exceed ${MAX_FEES} (10 lakh)`).optional(),
  avgFees: z.number().min(MIN_FEES, `avgFees must be at least ${MIN_FEES}`).max(MAX_FEES, `avgFees must not exceed ${MAX_FEES} (10 lakh)`).optional(),
  steps: z.array(z.string()).optional(),
  aftercare: z.array(z.string()).optional(),
  followUpRequired: z.boolean().optional(),
  followUpAfterDays: z.number().int().positive().optional(),
  risks: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  isOneTime: z.boolean().optional(),
  regularVisitInterval: z.object({
    interval: z.number().positive('regularVisitInterval.interval must be a positive number'),
    unit: z.string().min(1, 'regularVisitInterval.unit is required'),
  }).optional().nullable(),
}).refine((data) => {
  if (data.minDuration !== undefined && data.maxDuration !== undefined) {
    return data.minDuration <= data.maxDuration;
  }
  return true;
}, {
  message: 'minDuration must be less than or equal to maxDuration',
  path: ['minDuration'],
}).refine((data) => {
  if (data.minFees !== undefined && data.maxFees !== undefined) {
    return data.minFees <= data.maxFees;
  }
  return true;
}, {
  message: 'minFees must be less than or equal to maxFees',
  path: ['minFees'],
}).refine((data) => {
  if (data.avgDuration !== undefined) {
    if (data.minDuration !== undefined && data.avgDuration < data.minDuration) {
      return false;
    }
    if (data.maxDuration !== undefined && data.avgDuration > data.maxDuration) {
      return false;
    }
  }
  return true;
}, {
  message: 'avgDuration must be between minDuration and maxDuration',
  path: ['avgDuration'],
}).refine((data) => {
  if (data.avgFees !== undefined) {
    if (data.minFees !== undefined && data.avgFees < data.minFees) {
      return false;
    }
    if (data.maxFees !== undefined && data.avgFees > data.maxFees) {
      return false;
    }
  }
  return true;
}, {
  message: 'avgFees must be between minFees and maxFees',
  path: ['avgFees'],
}).refine((data) => {
  if (data.isOneTime === true && data.regularVisitInterval !== undefined && data.regularVisitInterval !== null) {
    return false;
  }
  return true;
}, {
  message: 'Cannot set regularVisitInterval when isOneTime is true',
  path: ['regularVisitInterval'],
});

export const updateTreatmentSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  description: z.string().optional(),
  minDuration: z.number().min(MIN_DURATION_MONTHS, `minDuration must be at least ${MIN_DURATION_MONTHS} months`).max(MAX_DURATION_MONTHS, `minDuration must not exceed ${MAX_DURATION_MONTHS} months`).optional(),
  maxDuration: z.number().min(MIN_DURATION_MONTHS, `maxDuration must be at least ${MIN_DURATION_MONTHS} months`).max(MAX_DURATION_MONTHS, `maxDuration must not exceed ${MAX_DURATION_MONTHS} months`).optional(),
  avgDuration: z.number().min(MIN_DURATION_MONTHS, `avgDuration must be at least ${MIN_DURATION_MONTHS} months`).max(MAX_DURATION_MONTHS, `avgDuration must not exceed ${MAX_DURATION_MONTHS} months`).optional(),
  minFees: z.number().min(MIN_FEES, `minFees must be at least ${MIN_FEES}`).max(MAX_FEES, `minFees must not exceed ${MAX_FEES} (10 lakh)`).optional(),
  maxFees: z.number().min(MIN_FEES, `maxFees must be at least ${MIN_FEES}`).max(MAX_FEES, `maxFees must not exceed ${MAX_FEES} (10 lakh)`).optional(),
  avgFees: z.number().min(MIN_FEES, `avgFees must be at least ${MIN_FEES}`).max(MAX_FEES, `avgFees must not exceed ${MAX_FEES} (10 lakh)`).optional(),
  steps: z.array(z.string()).optional(),
  aftercare: z.array(z.string()).optional(),
  followUpRequired: z.boolean().optional(),
  followUpAfterDays: z.number().int().positive().optional(),
  risks: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  isOneTime: z.boolean().optional(),
  regularVisitInterval: z.object({
    interval: z.number().positive('regularVisitInterval.interval must be a positive number'),
    unit: z.string().min(1, 'regularVisitInterval.unit is required'),
  }).optional().nullable(),
}).refine((data) => {
  if (data.isOneTime === true && data.regularVisitInterval !== undefined && data.regularVisitInterval !== null) {
    return false;
  }
  return true;
}, {
  message: 'Cannot set regularVisitInterval when isOneTime is true',
  path: ['regularVisitInterval'],
});


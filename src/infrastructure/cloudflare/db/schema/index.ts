import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

const createdAt = () => integer('created_at', { mode: 'timestamp_ms' }).notNull();
const updatedAt = () => integer('updated_at', { mode: 'timestamp_ms' }).notNull();

export interface WorkingDay {
  day: string;
  startTime: string;
  endTime: string;
}

export interface AppointmentItem {
  patientId: string;
  treatmentId?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  completed: boolean;
}

export interface PrescriptionItem {
  medicineName: string;
  form?: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  notes?: string;
}

export const doctors = sqliteTable('doctors', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  refreshToken: text('refresh_token'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const clinics = sqliteTable(
  'clinics',
  {
    id: text('id').primaryKey(),
    clinicId: text('clinic_id').notNull(),
    doctorId: text('doctor_id').notNull().references(() => doctors.id),
    name: text('name').notNull(),
    address: text('address'),
    city: text('city'),
    state: text('state'),
    pincode: text('pincode'),
    phone: text('phone'),
    email: text('email'),
    website: text('website'),
    locationUrl: text('location_url'),
    workingDays: text('working_days', { mode: 'json' }).$type<WorkingDay[]>(),
    treatments: text('treatments', { mode: 'json' }).$type<string[]>(),
    images: text('images', { mode: 'json' }).$type<string[]>(),
    notes: text('notes'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('clinics_doctor_idx').on(t.doctorId),
    uniqueIndex('clinics_doctor_name_uq').on(t.doctorId, t.name).where(sql`${t.isDeleted} = 0`),
    uniqueIndex('clinics_doctor_clinicid_uq').on(t.doctorId, t.clinicId).where(sql`${t.isDeleted} = 0`),
  ]
);

export const staff = sqliteTable(
  'staff',
  {
    id: text('id').primaryKey(),
    username: text('username').notNull().unique(),
    password: text('password').notNull(),
    clinicId: text('clinic_id').notNull().references(() => clinics.id),
    doctorId: text('doctor_id').notNull().references(() => doctors.id),
    role: text('role', { enum: ['staff'] }).notNull().default('staff'),
    refreshToken: text('refresh_token'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('staff_doctor_idx').on(t.doctorId),
    index('staff_clinic_idx').on(t.clinicId),
  ]
);

export const treatments = sqliteTable(
  'treatments',
  {
    id: text('id').primaryKey(),
    doctorId: text('doctor_id').notNull().references(() => doctors.id),
    name: text('name').notNull(),
    description: text('description'),
    minDuration: integer('min_duration'),
    maxDuration: integer('max_duration'),
    avgDuration: integer('avg_duration'),
    minFees: real('min_fees'),
    maxFees: real('max_fees'),
    avgFees: real('avg_fees'),
    steps: text('steps', { mode: 'json' }).$type<string[]>(),
    aftercare: text('aftercare', { mode: 'json' }).$type<string[]>(),
    followUpRequired: integer('follow_up_required', { mode: 'boolean' }).default(false),
    followUpAfterDays: integer('follow_up_after_days'),
    risks: text('risks', { mode: 'json' }).$type<string[]>(),
    images: text('images', { mode: 'json' }).$type<string[]>(),
    isOneTime: integer('is_one_time', { mode: 'boolean' }),
    regularVisitIntervalValue: integer('regular_visit_interval_value'),
    regularVisitIntervalUnit: text('regular_visit_interval_unit', {
      enum: ['days', 'weeks', 'months', 'years'],
    }),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('treatments_doctor_idx').on(t.doctorId),
    uniqueIndex('treatments_doctor_name_uq').on(t.doctorId, t.name).where(sql`${t.isDeleted} = 0`),
  ]
);

export const patients = sqliteTable(
  'patients',
  {
    id: text('id').primaryKey(),
    doctorId: text('doctor_id').notNull().references(() => doctors.id),
    primaryClinicId: text('primary_clinic_id').references(() => clinics.id),
    patientId: text('patient_id').unique(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name'),
    fullName: text('full_name'),
    dob: integer('dob', { mode: 'timestamp_ms' }),
    age: integer('age'),
    gender: text('gender', { enum: ['male', 'female', 'other', 'unknown'] }).default('unknown'),
    phone: text('phone'),
    email: text('email'),
    address: text('address'),
    profilePicUrl: text('profile_pic_url'),
    consultationType: text('consultation_type', { enum: ['one-time', 'treatment-plan'] }).notNull(),
    tags: text('tags', { mode: 'json' }).$type<string[]>(),
    clinics: text('clinics', { mode: 'json' }).$type<string[]>(),
    treatmentCourses: text('treatment_courses', { mode: 'json' }).$type<string[]>(),
    visitCount: integer('visit_count').notNull().default(0),
    lastVisitAt: integer('last_visit_at', { mode: 'timestamp_ms' }),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('patients_doctor_deleted_idx').on(t.doctorId, t.isDeleted),
    index('patients_phone_idx').on(t.phone),
  ]
);

export const treatmentCourses = sqliteTable(
  'treatment_courses',
  {
    id: text('id').primaryKey(),
    doctorId: text('doctor_id').notNull().references(() => doctors.id),
    patientId: text('patient_id').notNull().references(() => patients.id),
    clinicId: text('clinic_id').references(() => clinics.id),
    treatmentId: text('treatment_id').notNull().references(() => treatments.id),
    startDate: integer('start_date', { mode: 'timestamp_ms' }).notNull(),
    expectedEndDate: integer('expected_end_date', { mode: 'timestamp_ms' }),
    lastVisitDate: integer('last_visit_date', { mode: 'timestamp_ms' }),
    nextVisitDate: integer('next_visit_date', { mode: 'timestamp_ms' }),
    totalCost: real('total_cost').notNull().default(0),
    totalPaid: real('total_paid').notNull().default(0),
    isPaymentCompleted: integer('is_payment_completed', { mode: 'boolean' }).notNull().default(false),
    isMedicallyCompleted: integer('is_medically_completed', { mode: 'boolean' }).notNull().default(false),
    status: text('status', { enum: ['active', 'paused', 'completed', 'cancelled'] }).notNull().default('active'),
    notes: text('notes'),
    visits: text('visits', { mode: 'json' }).$type<string[]>(),
    payments: text('payments', { mode: 'json' }).$type<string[]>(),
    isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('courses_doctor_patient_status_idx').on(t.doctorId, t.patientId, t.status),
    index('courses_clinic_idx').on(t.clinicId),
    index('courses_next_visit_idx').on(t.nextVisitDate),
  ]
);

export const visits = sqliteTable(
  'visits',
  {
    id: text('id').primaryKey(),
    doctorId: text('doctor_id').notNull().references(() => doctors.id),
    patientId: text('patient_id').notNull().references(() => patients.id),
    courseId: text('course_id').notNull().references(() => treatmentCourses.id),
    clinicId: text('clinic_id').references(() => clinics.id),
    visitDate: integer('visit_date', { mode: 'timestamp_ms' }).notNull(),
    notes: text('notes'),
    billedAmount: real('billed_amount').default(0),
    mediaIds: text('media_ids', { mode: 'json' }).$type<string[]>(),
    prescriptionId: text('prescription_id'),
    isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('visits_doctor_patient_date_idx').on(t.doctorId, t.patientId, t.visitDate),
    index('visits_course_idx').on(t.courseId),
    index('visits_clinic_idx').on(t.clinicId),
  ]
);

export const prescriptions = sqliteTable(
  'prescriptions',
  {
    id: text('id').primaryKey(),
    doctorId: text('doctor_id').notNull().references(() => doctors.id),
    patientId: text('patient_id').notNull().references(() => patients.id),
    visitId: text('visit_id').notNull().references(() => visits.id),
    clinicId: text('clinic_id').references(() => clinics.id),
    diagnosis: text('diagnosis', { mode: 'json' }).$type<string[]>(),
    items: text('items', { mode: 'json' }).$type<PrescriptionItem[]>(),
    notes: text('notes'),
    isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('prescriptions_doctor_patient_idx').on(t.doctorId, t.patientId),
    index('prescriptions_visit_idx').on(t.visitId),
  ]
);

export const payments = sqliteTable(
  'payments',
  {
    id: text('id').primaryKey(),
    doctorId: text('doctor_id').notNull().references(() => doctors.id),
    patientId: text('patient_id').notNull().references(() => patients.id),
    courseId: text('course_id').notNull().references(() => treatmentCourses.id),
    visitId: text('visit_id').references(() => visits.id),
    clinicId: text('clinic_id').references(() => clinics.id),
    amount: real('amount').notNull(),
    method: text('method', { enum: ['cash', 'card', 'upi', 'bank', 'insurance', 'online'] }).notNull().default('cash'),
    reference: text('reference'),
    paidAt: integer('paid_at', { mode: 'timestamp_ms' }).notNull(),
    refunded: integer('refunded', { mode: 'boolean' }).notNull().default(false),
    refundRefundedAt: integer('refund_refunded_at', { mode: 'timestamp_ms' }),
    refundReason: text('refund_reason'),
    refundAmount: real('refund_amount'),
    isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('payments_doctor_clinic_paidat_idx').on(t.doctorId, t.clinicId, t.paidAt),
    index('payments_doctor_patient_idx').on(t.doctorId, t.patientId),
    index('payments_course_idx').on(t.courseId),
  ]
);

export const media = sqliteTable(
  'media',
  {
    id: text('id').primaryKey(),
    doctorId: text('doctor_id').notNull().references(() => doctors.id),
    patientId: text('patient_id').references(() => patients.id),
    courseId: text('course_id').references(() => treatmentCourses.id),
    visitId: text('visit_id').references(() => visits.id),
    clinicId: text('clinic_id').references(() => clinics.id),
    url: text('url').notNull(),
    filename: text('filename'),
    mimeType: text('mime_type'),
    size: integer('size'),
    type: text('type', { enum: ['image', 'xray', 'report', 'other'] }).default('image'),
    notes: text('notes'),
    isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('media_doctor_patient_idx').on(t.doctorId, t.patientId),
    index('media_doctor_course_idx').on(t.doctorId, t.courseId),
    index('media_visit_idx').on(t.visitId),
  ]
);

export const patientIdCounters = sqliteTable('patient_id_counters', {
  clinicId: text('clinic_id').primaryKey(),
  sequence: integer('sequence').notNull().default(0),
  updatedAt: updatedAt(),
});

/**
 * `date` is a plain YYYY-MM-DD string rather than a timestamp. The Mongo original
 * normalized to local midnight and grouped with the *server's* timezone offset;
 * Workers always run UTC, so porting that literally would shift every date for
 * non-UTC users. A text date has no timezone axis and matches the wire format the
 * client already sends. Appointments stay an embedded JSON array, mirroring how the
 * rest of this schema stores Mongo subdocuments — the HTTP API addresses them by
 * index, so ordering must be stable.
 */
export const calendarEntries = sqliteTable(
  'calendar_entries',
  {
    id: text('id').primaryKey(),
    doctorId: text('doctor_id').notNull().references(() => doctors.id),
    clinicId: text('clinic_id').notNull().references(() => clinics.id),
    date: text('date').notNull(),
    startTime: text('start_time').notNull(),
    endTime: text('end_time').notNull(),
    notes: text('notes'),
    appointments: text('appointments', { mode: 'json' }).$type<AppointmentItem[]>().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('calendar_entries_doctor_date_idx').on(t.doctorId, t.date),
    index('calendar_entries_doctor_date_clinic_idx').on(t.doctorId, t.date, t.clinicId),
  ]
);

export type DoctorRow = typeof doctors.$inferSelect;
export type ClinicRow = typeof clinics.$inferSelect;
export type StaffRow = typeof staff.$inferSelect;
export type TreatmentRow = typeof treatments.$inferSelect;
export type PatientRow = typeof patients.$inferSelect;
export type TreatmentCourseRow = typeof treatmentCourses.$inferSelect;
export type VisitRow = typeof visits.$inferSelect;
export type PrescriptionRow = typeof prescriptions.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;
export type MediaRow = typeof media.$inferSelect;
export type PatientIdCounterRow = typeof patientIdCounters.$inferSelect;
export type CalendarEntryRow = typeof calendarEntries.$inferSelect;

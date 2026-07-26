import { BaseRepository } from './base.repository';
import { TreatmentCourse } from '../entities/treatment-course.entity';
import { TreatmentCourseStatus } from '../value-objects/treatment-course-status.vo';

export interface TreatmentCourseSearchOptions {
  doctorId: string;
  page: number;
  limit: number;
  clinicId?: string;
  treatmentId?: string;
  patientId?: string;
  status?: TreatmentCourseStatus;
  startDateFrom?: Date;
  startDateTo?: Date;
  sortBy?: 'createdAt' | 'startDate' | 'totalCost' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface VisitReminderSearchOptions {
  doctorId: string;
  page: number;
  limit: number;
  daysBefore: number;
  daysAfter: number;
  treatmentIds?: string[];
  clinicIds?: string[];
}

export interface VisitReminderResult {
  treatmentCourseId: string;
  patientName: string;
  treatmentName: string;
  clinicName?: string;
  nextVisitDate: Date;
}

export interface ITreatmentCourseRepository extends BaseRepository<TreatmentCourse> {
  findByIdAndDoctor(id: string, doctorId: string): Promise<TreatmentCourse | null>;
  findPaginated(options: TreatmentCourseSearchOptions): Promise<{
    treatmentCourses: TreatmentCourse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  findByPatientAndTreatmentAndStatus(doctorId: string, patientId: string, treatmentId: string, statuses: TreatmentCourseStatus[]): Promise<TreatmentCourse | null>;
  incrementTotalPaid(courseId: string, amount: number, session?: any, paymentId?: string): Promise<TreatmentCourse | null>;
  decrementTotalPaid(courseId: string, amount: number, session?: any): Promise<TreatmentCourse | null>;
  markDeletedByPatientId(patientId: string, doctorId: string, session?: any): Promise<number>;
  markRestoredByPatientId(patientId: string, doctorId: string, session?: any): Promise<number>;
  findVisitReminders(options: VisitReminderSearchOptions): Promise<{
    reminders: VisitReminderResult[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  /** Unpaid balance across active and paused courses; never negative per course. */
  getOutstandingAmount(doctorId: string, clinicId?: string): Promise<number>;
}


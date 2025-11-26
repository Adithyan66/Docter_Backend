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

export interface ITreatmentCourseRepository extends BaseRepository<TreatmentCourse> {
  findByIdAndDoctor(id: string, doctorId: string): Promise<TreatmentCourse | null>;
  findPaginated(options: TreatmentCourseSearchOptions): Promise<{
    treatmentCourses: TreatmentCourse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  incrementTotalPaid(courseId: string, amount: number, session?: any, paymentId?: string): Promise<TreatmentCourse | null>;
  decrementTotalPaid(courseId: string, amount: number, session?: any): Promise<TreatmentCourse | null>;
}


import { TreatmentCourseStatus } from '../../domain/value-objects/treatment-course-status.vo';

export interface CreateTreatmentCourseRequestDto {
  patientId: string;
  clinicId?: string;
  treatmentId: string;
  startDate: string;
  expectedEndDate?: string;
  totalCost: number;
  totalPaid?: number;
  status?: TreatmentCourseStatus;
  notes?: string;
  visits?: string[];
  payments?: string[];
}

export interface UpdateTreatmentCourseRequestDto {
  patientId?: string;
  clinicId?: string;
  treatmentId?: string;
  startDate?: string;
  expectedEndDate?: string;
  totalCost?: number;
  totalPaid?: number;
  isPaymentCompleted?: boolean;
  isMedicallyCompleted?: boolean;
  status?: TreatmentCourseStatus;
  notes?: string;
  visits?: string[];
  payments?: string[];
}

export interface TreatmentCourseResponseDto {
  id: string;
  doctorId: string;
  patientId: string;
  clinicId?: string;
  treatmentId: string;
  startDate: Date;
  expectedEndDate?: Date;
  totalCost: number;
  totalPaid: number;
  remaining: number;
  isPaymentCompleted: boolean;
  isMedicallyCompleted: boolean;
  status: TreatmentCourseStatus;
  notes?: string;
  visits: string[];
  payments: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetTreatmentCoursesQueryDto {
  page?: number;
  limit?: number;
  clinicId?: string;
  treatmentId?: string;
  patientId?: string;
  status?: TreatmentCourseStatus;
  startDateFrom?: string;
  startDateTo?: string;
  sortBy?: 'createdAt' | 'startDate' | 'totalCost' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedTreatmentCoursesResponseDto {
  treatmentCourses: TreatmentCourseResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


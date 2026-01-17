import { BaseRepository } from './base.repository';
import { Clinic } from '../entities/clinic.entity';

export interface FindAllPaginatedOptions {
  page: number;
  limit: number;
  search?: string;
  doctorId: string;
  sortBy?: 'createdAt' | 'numOfPatients' | 'onGoingTreatments' | 'completedTreatments';
  sortOrder?: 'asc' | 'desc';
}

export interface ClinicListResult {
  id: string;
  name: string;
  clinicId: string;
  city: string;
  numOfPatients: number;
  onGoingTreatments: number;
  completedTreatments: number;
}

export interface ClinicStatisticsOptions {
  doctorId: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  treatmentId?: string;
}

export interface ClinicStatistics {
  patients: {
    totalCount: number;
    uniqueCount: number;
  };
  treatmentCourses: {
    totalCount: number;
    statusBreakdown: {
      active: number;
      paused: number;
      completed: number;
      cancelled: number;
    };
    medicallyCompleted: number;
    paymentCompleted: number;
  };
  revenue: {
    totalPaid: number;
    totalCost: number;
    outstanding: number;
    averagePerCourse: {
      paid: number;
      cost: number;
    };
    byPaymentMethod: {
      cash: number;
      card: number;
      upi: number;
      bank: number;
      insurance: number;
      online: number;
    };
    refunds: {
      totalAmount: number;
      count: number;
    };
  };
  treatments: Array<{
    treatmentId: string;
    treatmentName: string;
    courseCount: number;
    totalPaid: number;
    totalCost: number;
    outstanding: number;
  }>;
  visits: {
    totalCount: number;
    averagePerCourse: number;
    totalBilledAmount: number;
    averageBilledAmount: number;
  };
  timeMetrics: {
    earliestStartDate?: Date;
    latestStartDate?: Date;
    averageDuration?: number;
  };
  completionRates: {
    treatment: number;
    payment: number;
    medical: number;
    cancellation: number;
  };
}

export interface GetClinicImagesOptions {
  page: number;
  limit: number;
}

export interface IClinicRepository extends BaseRepository<Clinic> {
  findAllPaginated(options: FindAllPaginatedOptions): Promise<{ clinics: ClinicListResult[]; total: number; page: number; limit: number; totalPages: number }>;
  findByName(name: string, doctorId: string): Promise<Clinic | null>;
  findByClinicId(clinicId: string, doctorId: string): Promise<Clinic | null>;
  existsByClinicIdAndDoctorId(clinicId: string, doctorId: string): Promise<boolean>;
  findNames(doctorId: string, search?: string): Promise<Array<{ id: string; name: string }>>;
  getStatistics(clinicId: string, options: ClinicStatisticsOptions): Promise<ClinicStatistics>;
  getClinicImages(clinicId: string, options: GetClinicImagesOptions): Promise<{ images: string[]; total: number; page: number; limit: number; totalPages: number }>;
  deleteClinicImage(clinicId: string, imageIndex: number): Promise<boolean>;
  addClinicImages(clinicId: string, imageUrls: string[]): Promise<boolean>;
}


import { BaseRepository } from './base.repository';
import { Treatment } from '../entities/treatment.entity';

export interface FindAllPaginatedOptions {
  page: number;
  limit: number;
  sortBy?: 'averageAmount' | 'averageDuration' | 'numberOfPatients' | 'ongoing' | 'completed' | '';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  doctorId: string;
}

export interface TreatmentListResult {
  id: string;
  name: string;
  isActive: boolean;
  avgFees?: number;
  avgDuration?: number;
  numberOfPatients: number;
  ongoing: number;
  completed: number;
}

export interface TreatmentStatisticsOptions {
  doctorId: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  clinicId?: string;
}

export interface TreatmentStatistics {
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
  clinics: Array<{
    clinicId: string;
    clinicName: string;
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

export interface ITreatmentRepository extends BaseRepository<Treatment> {
  findAllPaginated(options: FindAllPaginatedOptions): Promise<{ treatments: TreatmentListResult[]; total: number; page: number; limit: number; totalPages: number }>;
  findAllActive(doctorId: string): Promise<Treatment[]>;
  findByName(name: string, doctorId: string): Promise<Treatment | null>;
  findNames(doctorId: string, search?: string): Promise<Array<{ id: string; name: string }>>;
  getStatistics(treatmentId: string, options: TreatmentStatisticsOptions): Promise<TreatmentStatistics>;
}

 
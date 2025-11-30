import { DayOfWeek } from '../../domain/value-objects/working-day.vo';

export interface CreateClinicRequestDto {
  clinicId: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  locationUrl?: string;
  workingDays?: Array<{
    day: DayOfWeek;
    startTime: string;
    endTime: string;
  }>;
  treatments?: string[];
  images?: string[];
  notes?: string;
  isActive?: boolean;
}

export interface UpdateClinicRequestDto {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  locationUrl?: string;
  workingDays?: Array<{
    day: DayOfWeek;
    startTime: string;
    endTime: string;
  }>;
  treatments?: string[];
  images?: string[];
  notes?: string;
  isActive?: boolean;
}

export interface ClinicResponseDto {
  id: string;
  clinicId: string;
  doctorId: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  locationUrl?: string;
  workingDays?: Array<{
    day: DayOfWeek;
    startTime: string;
    endTime: string;
  }>;
  treatments?: Array<{ id: string; name: string }>;
  images?: string[];
  notes?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
  statistics?: ClinicStatisticsDto;
}

export interface ClinicStatisticsDto {
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

export interface GetClinicStatisticsOptions {
  startDateFrom?: Date;
  startDateTo?: Date;
  treatmentId?: string;
  include?: string[];
  exclude?: string[];
}

export interface ClinicListDto {
  id: string;
  name: string;
  clinicId: string;
  city: string;
  numOfPatients: number;
  onGoingTreatments: number;
  completedTreatments: number;
}

export interface PaginatedClinicsResponseDto {
  clinics: ClinicListDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


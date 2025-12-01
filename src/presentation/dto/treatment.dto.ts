export interface CreateTreatmentRequestDto {
  name: string;
  description?: string;
  minDuration?: number;
  maxDuration?: number;
  avgDuration?: number;
  minFees?: number;
  maxFees?: number;
  avgFees?: number;
  steps?: string[];
  aftercare?: string[];
  followUpRequired?: boolean;
  followUpAfterDays?: number;
  risks?: string[];
  images?: string[];
  isOneTime?: boolean;
  regularVisitInterval?: { interval: number; unit: string };
}

export interface UpdateTreatmentRequestDto {
  name?: string;
  description?: string;
  minDuration?: number;
  maxDuration?: number;
  avgDuration?: number;
  minFees?: number;
  maxFees?: number;
  avgFees?: number;
  steps?: string[];
  aftercare?: string[];
  followUpRequired?: boolean;
  followUpAfterDays?: number;
  risks?: string[];
  images?: string[];
  isOneTime?: boolean;
  regularVisitInterval?: { interval: number; unit: string };
}

export interface TreatmentResponseDto {
  id: string;
  doctorId: string;
  name: string;
  description?: string;
  minDuration?: number;
  maxDuration?: number;
  avgDuration?: number;
  minFees?: number;
  maxFees?: number;
  avgFees?: number;
  steps?: string[];
  aftercare?: string[];
  followUpRequired?: boolean;
  followUpAfterDays?: number;
  risks?: string[];
  images?: string[];
  isOneTime?: boolean;
  regularVisitInterval?: { interval: number; unit: string };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  statistics?: TreatmentStatisticsDto;
}

export interface TreatmentStatisticsDto {
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

export interface GetTreatmentStatisticsOptions {
  startDateFrom?: Date;
  startDateTo?: Date;
  clinicId?: string;
  include?: string[];
  exclude?: string[];
}

export interface TreatmentList {
  id: string;
  name: string;
  isActive: boolean;
  avgFees?: number;
  avgDuration?: number;
  numberOfPatients: number;
  ongoing: number;
  completed: number;
}

export interface PaginatedTreatmentsResponseDto {
  treatments: TreatmentList[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


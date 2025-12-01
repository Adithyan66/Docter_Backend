export interface DailyActivityItemDto {
  visitId: string;
  visitTime: Date;
  patientId: string;
  patientName: string;
  courseId: string;
  treatmentName: string;
  amountPaid: number;
  clinicId?: string | null;
  clinicName?: string | null;
}

export interface DailyActivitySummaryDto {
  totalPatientsVisited: number;
  totalVisits: number;
  totalAmount: number;
  averageAmountPerVisit: number;
  visitStartTime: Date | null;
  visitEndTime: Date | null;
  totalHoursWorked: number;
  clinicNames: string[];
}

export interface GetDailyActivitiesQueryDto {
  date: string;
  page?: number;
  limit?: number;
  clinicId?: string;
}

export interface PaginatedDailyActivitiesResponseDto {
  summary: DailyActivitySummaryDto;
  activities: DailyActivityItemDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}


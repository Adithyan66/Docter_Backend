export interface GetVisitRemindersQueryDto {
  page?: number;
  limit?: number;
  daysBefore?: number;
  daysAfter?: number;
  treatmentId?: string;
  clinicId?: string;
}

export interface VisitReminderResponseDto {
  treatmentCourseId: string;
  patientName: string;
  treatmentName: string;
  clinicName?: string;
  nextVisitDate: Date;
}

export interface PaginatedVisitRemindersResponseDto {
  reminders: VisitReminderResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


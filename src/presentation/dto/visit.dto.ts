export interface CreateVisitRequestDto {
  patientId: string;
  courseId: string;
  clinicId?: string;
  notes?: string;
  billedAmount?: number;
  mediaIds?: string[];
  prescriptionId?: string;
}

export interface UpdateVisitRequestDto {
  patientId?: string;
  courseId?: string;
  clinicId?: string;
  notes?: string;
  billedAmount?: number;
  mediaIds?: string[];
  prescriptionId?: string;
}

export interface VisitResponseDto {
  id: string;
  doctorId: string;
  patientId: string;
  courseId: string;
  clinicId?: string;
  visitDate: Date;
  notes?: string;
  billedAmount?: number;
  mediaIds: string[];
  prescriptionId?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetVisitsQueryDto {
  page?: number;
  limit?: number;
  patientId?: string;
  courseId?: string;
  clinicId?: string;
  visitDateFrom?: string;
  visitDateTo?: string;
  notes?: string;
  sortBy?: 'visitDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedVisitsResponseDto {
  visits: VisitResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


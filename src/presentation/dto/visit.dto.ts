import { PrescriptionItemDto, PrescriptionResponseDto } from './prescription.dto';
import { MediaResponseDto } from './media.dto';
import { MediaType } from '../../domain/entities/media.entity';

export interface CreateVisitPrescriptionDto {
  clinicId?: string;
  diagnosis?: string[];
  items: PrescriptionItemDto[];
  notes?: string;
}

export interface CreateVisitMediaDto {
  url: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  type?: MediaType;
  notes?: string;
}

export interface CreateVisitRequestDto {
  patientId: string;
  courseId: string;
  clinicId?: string;
  notes?: string;
  billedAmount?: number;
  nextVisitDate?: Date;
  visitDate?: Date;
  paymentMethod?: 'cash' | 'card' | 'upi' | 'bank' | 'insurance' | 'online';
  paymentReference?: string;
  mediaIds?: string[];
  prescriptionId?: string;
  prescription?: CreateVisitPrescriptionDto;
  media?: CreateVisitMediaDto[];
}

export interface UpdateVisitRequestDto {
  patientId?: string;
  courseId?: string;
  clinicId?: string;
  notes?: string;
  billedAmount?: number;
  paymentMethod?: 'cash' | 'card' | 'upi' | 'bank' | 'insurance' | 'online';
  paymentReference?: string;
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
  prescription?: PrescriptionResponseDto | null;
  media?: MediaResponseDto[];
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
  include?: string;
}

export interface PaginatedVisitsResponseDto {
  visits: VisitResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


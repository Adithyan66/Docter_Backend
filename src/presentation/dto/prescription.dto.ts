import { PrescriptionItem } from '../../domain/entities/prescription.entity';

export interface PrescriptionItemDto {
  medicineName: string;
  form?: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  notes?: string;
}

export interface CreatePrescriptionRequestDto {
  patientId: string;
  visitId: string;
  clinicId?: string;
  diagnosis?: string[];
  items: PrescriptionItemDto[];
  notes?: string;
}

export interface UpdatePrescriptionRequestDto {
  visitId?: string;
  clinicId?: string;
  diagnosis?: string[];
  items?: PrescriptionItemDto[];
  notes?: string;
}

export interface PrescriptionResponseDto {
  id: string;
  doctorId: string;
  patientId: string;
  visitId: string;
  clinicId?: string;
  diagnosis: string[];
  items: PrescriptionItemDto[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetPrescriptionsQueryDto {
  page?: number;
  limit?: number;
  patientId?: string;
  visitId?: string;
  clinicId?: string;
  dateFrom?: string;
  dateTo?: string;
  medicineName?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedPrescriptionsResponseDto {
  prescriptions: PrescriptionResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


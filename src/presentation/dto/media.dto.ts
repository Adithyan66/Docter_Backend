import { MediaType } from '../../domain/entities/media.entity';

export interface CreateMediaRequestDto {
  patientId?: string;
  courseId?: string;
  visitId?: string;
  clinicId?: string;
  url: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  type?: MediaType;
  notes?: string;
}

export interface UpdateMediaRequestDto {
  patientId?: string;
  courseId?: string;
  visitId?: string;
  clinicId?: string;
  url?: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  type?: MediaType;
  notes?: string;
}

export interface MediaResponseDto {
  id: string;
  doctorId: string;
  patientId?: string;
  courseId?: string;
  visitId?: string;
  clinicId?: string;
  url: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  type: MediaType;
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetMediaQueryDto {
  page?: number;
  limit?: number;
  patientId?: string;
  courseId?: string;
  visitId?: string;
  clinicId?: string;
  type?: MediaType;
  sortBy?: 'createdAt' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedMediaResponseDto {
  media: MediaResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


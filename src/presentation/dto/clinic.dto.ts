import { DayOfWeek } from '../../domain/value-objects/working-day.vo';

export interface CreateClinicRequestDto {
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
}

export interface PaginatedClinicsResponseDto {
  clinics: ClinicResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


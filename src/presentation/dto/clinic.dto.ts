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


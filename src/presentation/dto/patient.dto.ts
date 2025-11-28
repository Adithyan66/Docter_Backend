import { PatientConsultationType, PatientGender } from '../../domain/entities/patient.entity';

export interface CreatePatientRequestDto {
  primaryClinic: string;
  clinics?: string[];
  firstName: string;
  lastName?: string;
  fullName?: string;
  dob?: string;
  age?: number;
  gender?: PatientGender;
  phone?: string;
  email?: string;
  address?: string;
  profilePicUrl?: string;
  consultationType: PatientConsultationType;
  tags?: string[];
  visitCount?: number;
  lastVisitAt?: string;
  isActive?: boolean;
}

export interface UpdatePatientRequestDto {
  primaryClinic?: string;
  clinics?: string[];
  patientId?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  dob?: string;
  age?: number;
  gender?: PatientGender;
  phone?: string;
  email?: string;
  address?: string;
  profilePicUrl?: string;
  consultationType?: PatientConsultationType;
  tags?: string[];
  visitCount?: number;
  lastVisitAt?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface PatientResponseDto {
  id: string;
  primaryClinicName?: string;
  patientId?: string;
  fullName: string;
  age?: number;
  gender: PatientGender;
  phone?: string;
  email?: string;
  profilePicUrl?: string;
  consultationType: PatientConsultationType;
  visitCount: number;
  lastVisitAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedPatientsResponseDto {
  patients: PatientResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetPatientsQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  patientId?: string;
  clinicId?: string;
  gender?: PatientGender;
  consultationType?: PatientConsultationType;
  minAge?: number;
  maxAge?: number;
  sortBy?: 'createdAt' | 'fullName' | 'visitCount' | 'lastVisitAt';
  sortOrder?: 'asc' | 'desc';
}



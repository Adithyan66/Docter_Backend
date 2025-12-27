import { DayOfWeek } from '../../../../domain/value-objects/working-day.vo';
import { Clinic } from '../../../../domain/entities/clinic.entity';

export interface CreateClinicInput {
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
  notes?: string;
  isActive?: boolean;
}

export interface UpdateClinicInput {
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
  notes?: string;
  isActive?: boolean;
}

export interface GetClinicOptions {
  includeStatistics?: boolean;
  startDateFrom?: Date;
  startDateTo?: Date;
  treatmentId?: string;
  include?: string[];
  exclude?: string[];
}

export interface GetClinicResult {
  clinic: Clinic;
  statistics?: any;
}

export type GetClinicsParams = {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'numOfPatients' | 'onGoingTreatments' | 'completedTreatments';
  sortOrder?: 'asc' | 'desc';
  search?: string;
};

export interface ICreateClinicUseCase {
  execute(doctorId: string, input: CreateClinicInput): Promise<void>;
}

export interface IUpdateClinicUseCase {
  execute(id: string, doctorId: string, input: UpdateClinicInput): Promise<void>;
}

export interface IDeleteClinicUseCase {
  execute(id: string, doctorId: string): Promise<void>;
}

export interface IGetClinicUseCase {
  execute(
    id: string,
    requester: { doctorId: string; role: 'doctor' | 'staff'; clinicId?: string },
    options?: GetClinicOptions
  ): Promise<GetClinicResult>;
}

export interface IGetAllClinicsUseCase {
  execute(
    doctorId: string,
    params?: GetClinicsParams
  ): Promise<{ clinics: any[]; total: number; page: number; limit: number; totalPages: number }>;
}

export interface IGetClinicNamesUseCase {
  execute(doctorId: string, search?: string): Promise<Array<{ id: string; name: string }>>;
}

export interface IGetClinicImagesUseCase {
  execute(
    clinicId: string,
    requester: { doctorId: string; role: 'doctor' | 'staff'; clinicId?: string },
    options: { page?: number; limit?: number }
  ): Promise<{ images: string[]; total: number; page: number; limit: number; totalPages: number }>;
}

export interface IAddClinicImagesUseCase {
  execute(clinicId: string, doctorId: string, imageUrls: string[]): Promise<void>;
}

export interface IDeleteClinicImageUseCase {
  execute(
    clinicId: string,
    imageIndex: number,
    imageUrl: string,
    requester: { doctorId: string; role: 'doctor' | 'staff'; clinicId?: string }
  ): Promise<boolean>;
}

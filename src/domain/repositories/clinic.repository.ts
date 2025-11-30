import { BaseRepository } from './base.repository';
import { Clinic } from '../entities/clinic.entity';

export interface FindAllPaginatedOptions {
  page: number;
  limit: number;
  search?: string;
  doctorId: string;
  sortBy?: 'createdAt' | 'numOfPatients' | 'onGoingTreatments' | 'completedTreatments';
  sortOrder?: 'asc' | 'desc';
}

export interface ClinicListResult {
  id: string;
  name: string;
  clinicId: string;
  city: string;
  numOfPatients: number;
  onGoingTreatments: number;
  completedTreatments: number;
}

export interface IClinicRepository extends BaseRepository<Clinic> {
  findAllPaginated(options: FindAllPaginatedOptions): Promise<{ clinics: ClinicListResult[]; total: number; page: number; limit: number; totalPages: number }>;
  findByName(name: string, doctorId: string): Promise<Clinic | null>;
  findByClinicId(clinicId: string, doctorId: string): Promise<Clinic | null>;
  findNames(doctorId: string, search?: string): Promise<Array<{ id: string; name: string }>>;
}


import { BaseRepository } from './base.repository';
import { Patient, PatientConsultationType, PatientGender } from '../entities/patient.entity';

export interface PatientSearchOptions {
  doctorId: string;
  page: number;
  limit: number;
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

export interface IPatientRepository extends BaseRepository<Patient> {
  findByIdAndDoctor(id: string, doctorId: string): Promise<Patient | null>;
  findByPatientId(patientId: string): Promise<Patient | null>;
  findPaginated(options: PatientSearchOptions): Promise<{
    patients: Patient[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    clinicNames?: Record<string, string>;
  }>;
}



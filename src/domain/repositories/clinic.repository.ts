import { BaseRepository } from './base.repository';
import { Clinic } from '../entities/clinic.entity';

export interface FindAllPaginatedOptions {
  page: number;
  limit: number;
  search?: string;
}

export interface IClinicRepository extends BaseRepository<Clinic> {
  findAllPaginated(options: FindAllPaginatedOptions): Promise<{ clinics: Clinic[]; total: number; page: number; limit: number; totalPages: number }>;
  findByName(name: string): Promise<Clinic | null>;
  findByClinicId(clinicId: string): Promise<Clinic | null>;
  findNames(search?: string): Promise<Array<{ id: string; name: string }>>;
}


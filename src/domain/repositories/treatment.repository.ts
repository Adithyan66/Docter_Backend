import { BaseRepository } from './base.repository';
import { Treatment } from '../entities/treatment.entity';

export interface FindAllPaginatedOptions {
  page: number;
  limit: number;
  sortBy?: 'fees' | 'duration' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  doctorId: string;
}

export interface ITreatmentRepository extends BaseRepository<Treatment> {
  findAllPaginated(options: FindAllPaginatedOptions): Promise<{ treatments: Treatment[]; total: number; page: number; limit: number; totalPages: number }>;
  findAllActive(doctorId: string): Promise<Treatment[]>;
  findByName(name: string, doctorId: string): Promise<Treatment | null>;
  findNames(doctorId: string, search?: string): Promise<Array<{ id: string; name: string }>>;
}

 
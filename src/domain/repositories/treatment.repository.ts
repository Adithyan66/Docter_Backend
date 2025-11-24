import { BaseRepository } from './base.repository';
import { Treatment } from '../entities/treatment.entity';

export interface FindAllPaginatedOptions {
  page: number;
  limit: number;
  sortBy?: 'fees' | 'duration' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface ITreatmentRepository extends BaseRepository<Treatment> {
  findAllPaginated(options: FindAllPaginatedOptions): Promise<{ treatments: Treatment[]; total: number; page: number; limit: number; totalPages: number }>;
  findAllActive(): Promise<Treatment[]>;
  findByName(name: string): Promise<Treatment | null>;
}

 
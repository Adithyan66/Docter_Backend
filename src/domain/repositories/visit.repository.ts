import { BaseRepository } from './base.repository';
import { Visit } from '../entities/visit.entity';

export interface VisitSearchOptions {
  doctorId: string;
  page: number;
  limit: number;
  patientId?: string;
  courseId?: string;
  clinicId?: string;
  visitDateFrom?: Date;
  visitDateTo?: Date;
  notes?: string;
  sortBy?: 'visitDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface IVisitRepository extends BaseRepository<Visit> {
  findByIdAndDoctor(id: string, doctorId: string): Promise<Visit | null>;
  findPaginated(options: VisitSearchOptions): Promise<{
    visits: Visit[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}


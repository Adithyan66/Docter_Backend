import { BaseRepository } from './base.repository';
import { Media, MediaType } from '../entities/media.entity';

export interface MediaSearchOptions {
  doctorId: string;
  page: number;
  limit: number;
  patientId?: string;
  courseId?: string;
  visitId?: string;
  clinicId?: string;
  type?: MediaType;
  sortBy?: 'createdAt' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface IMediaRepository extends BaseRepository<Media> {
  findByIdAndDoctor(id: string, doctorId: string): Promise<Media | null>;
  findPaginated(options: MediaSearchOptions): Promise<{
    media: Media[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  markDeletedByPatientId(patientId: string, doctorId: string, session?: any): Promise<number>;
  markRestoredByPatientId(patientId: string, doctorId: string, session?: any): Promise<number>;
}


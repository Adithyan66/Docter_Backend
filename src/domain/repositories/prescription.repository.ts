import { BaseRepository } from './base.repository';
import { Prescription } from '../entities/prescription.entity';

export interface PrescriptionSearchOptions {
  doctorId: string;
  page: number;
  limit: number;
  patientId?: string;
  visitId?: string;
  clinicId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  medicineName?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface IPrescriptionRepository extends BaseRepository<Prescription> {
  findByIdAndDoctor(id: string, doctorId: string): Promise<Prescription | null>;
  findPaginated(options: PrescriptionSearchOptions): Promise<{
    prescriptions: Prescription[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}


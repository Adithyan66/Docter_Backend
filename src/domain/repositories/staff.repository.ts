import { BaseRepository } from './base.repository';
import { Staff } from '../entities/staff.entity';

export interface FindAllStaffPaginatedOptions {
  doctorId: string;
  page: number;
  limit: number;
  username?: string;
  clinicId?: string;
  isActive?: boolean;
}

export interface PaginatedStaffResult {
  staff: Array<Staff & { clinicName?: string }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IStaffRepository extends BaseRepository<Staff> {
  findByIdWithClinicName(id: string): Promise<(Staff & { clinicName?: string }) | null>;
  findByUsername(username: string): Promise<Staff | null>;
  findByDoctorId(doctorId: string): Promise<Staff[]>;
  findByClinicId(clinicId: string): Promise<Staff[]>;
  updateRefreshToken(id: string, refreshToken: string | null): Promise<void>;
  findAllPaginated(options: FindAllStaffPaginatedOptions): Promise<PaginatedStaffResult>;
}



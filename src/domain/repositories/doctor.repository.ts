
import { BaseRepository } from './base.repository';
import { Doctor } from '../entities/doctor.entity';

export interface IDoctorRepository extends BaseRepository<Doctor> {
  findByEmail(email: string): Promise<Doctor | null>;
  updateRefreshToken(id: string, refreshToken: string | null): Promise<void>;
}


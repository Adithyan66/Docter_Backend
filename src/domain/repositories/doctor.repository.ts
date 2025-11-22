
import { BaseRepository } from './base.repository';
import { Doctor } from '../entities/doctor.entity';

export interface DoctorRepository extends BaseRepository<Doctor> {
  findByEmail(email: string): Promise<Doctor | null>;
}


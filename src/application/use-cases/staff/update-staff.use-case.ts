import { injectable, inject } from 'tsyringe';
import { IStaffRepository } from '../../../domain/repositories/staff.repository';
import { ValidationError } from '../../../domain/errors/validation.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { UpdateStaffRequestDto, StaffResponseDto } from '../../../presentation/dto/staff.dto';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';

@injectable()
export class UpdateStaffUseCase {
  constructor(
    @inject('IStaffRepository') private readonly staffRepository: IStaffRepository,
    @inject('IClinicRepository') private readonly clinicRepository: IClinicRepository
  ) {}

  async execute(id: string, doctorId: string, input: UpdateStaffRequestDto): Promise<StaffResponseDto> {
    const staff = await this.staffRepository.findById(id);
    if (!staff || staff.doctorId !== doctorId) {
      throw new NotFoundError('Staff');
    }

    if (input.username) {
      const other = await this.staffRepository.findByUsername(input.username);
      if (other && other.id !== id) {
        throw new ValidationError('username already exists');
      }
    }

    if (input.clinicId) {
      const clinic = await this.clinicRepository.findById(input.clinicId);
      if (!clinic || clinic.doctorId !== doctorId || clinic.isDeleted) {
        throw new ValidationError('clinicId is invalid');
      }
    }

    const updated = await this.staffRepository.update(id, {
      username: input.username,
      password: input.password,
      clinicId: input.clinicId,
      isActive: input.isActive,
    });

    if (!updated) {
      throw new NotFoundError('Staff');
    }

    return {
      id: updated.id,
      username: updated.username,
      clinicId: updated.clinicId,
      doctorId: updated.doctorId,
      role: updated.role,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}



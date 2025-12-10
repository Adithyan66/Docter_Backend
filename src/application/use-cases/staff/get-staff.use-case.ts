import { injectable, inject } from 'tsyringe';
import { IStaffRepository } from '../../../domain/repositories/staff.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { StaffResponseDto } from '../../../presentation/dto/staff.dto';

@injectable()
export class GetStaffUseCase {
  constructor(@inject('IStaffRepository') private readonly staffRepository: IStaffRepository) {}

  async execute(id: string, doctorId: string): Promise<StaffResponseDto> {
    const staff = await this.staffRepository.findById(id);
    if (!staff || staff.doctorId !== doctorId) {
      throw new NotFoundError('Staff');
    }
    return {
      id: staff.id,
      username: staff.username,
      clinicId: staff.clinicId,
      doctorId: staff.doctorId,
      role: staff.role,
      isActive: staff.isActive,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    };
  }
}



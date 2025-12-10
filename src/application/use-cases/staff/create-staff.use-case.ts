import { injectable, inject } from 'tsyringe';
import { IStaffRepository } from '../../../domain/repositories/staff.repository';
import { Staff } from '../../../domain/entities/staff.entity';
import { ValidationError } from '../../../domain/errors/validation.error';
import { CreateStaffRequestDto, StaffResponseDto } from '../../../presentation/dto/staff.dto';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { IPasswordService } from '../../interfaces/password-service.interface';

@injectable()
export class CreateStaffUseCase {
  constructor(
    @inject('IStaffRepository') private readonly staffRepository: IStaffRepository,
    @inject('IClinicRepository') private readonly clinicRepository: IClinicRepository,
    @inject('IPasswordService') private readonly passwordService: IPasswordService
  ) {}

  async execute(doctorId: string, input: CreateStaffRequestDto): Promise<StaffResponseDto> {
    const existing = await this.staffRepository.findByUsername(input.username);
    if (existing) {
      throw new ValidationError('username already exists');
    }

    const clinic = await this.clinicRepository.findById(input.clinicId);
    if (!clinic || clinic.doctorId !== doctorId || clinic.isDeleted) {
      throw new ValidationError('clinicId is invalid');
    }

    const hashedPassword = await this.passwordService.hash(input.password);
    const staff = new Staff('', input.username, hashedPassword, input.clinicId, doctorId, null, true);
    const created = await this.staffRepository.create(staff);
    return {
      id: created.id,
      username: created.username,
      clinicId: created.clinicId,
      doctorId: created.doctorId,
      role: created.role,
      isActive: created.isActive,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }
}



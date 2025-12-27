import { injectable, inject } from 'tsyringe';
import { IDoctorRepository } from '../../../domain/repositories/doctor.repository';
import { IStaffRepository } from '../../../domain/repositories/staff.repository';
import { IJwtService } from '../../interfaces/jwt-service.interface';
import { ILogoutUseCase } from '../../interfaces/use-cases/auth/auth-use-cases.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { ValidationError } from '../../../domain/errors/validation.error';
import { AuthenticationErrors } from '../../../infrastructure/constants/error-messages';

@injectable()
export class LogoutUseCase implements ILogoutUseCase {
  constructor(
    @inject('IDoctorRepository') private doctorRepository: IDoctorRepository,
    @inject('IStaffRepository') private staffRepository: IStaffRepository,
    @inject('IJwtService') private jwtService: IJwtService
  ) {}

  async execute(refreshToken: string): Promise<void> {
    let payload;
    try {
      payload = this.jwtService.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new ValidationError(AuthenticationErrors.INVALID_REFRESH_TOKEN);
    }

    if (payload.role === 'staff') {
      const staff = await this.staffRepository.findById(payload.id);
      if (!staff) {
        throw new NotFoundError('Staff');
      }
      if (!staff.refreshToken || staff.refreshToken !== refreshToken) {
        throw new ValidationError(AuthenticationErrors.INVALID_REFRESH_TOKEN);
      }
      await this.staffRepository.updateRefreshToken(staff.id, null);
      return;
    }

    const doctor = await this.doctorRepository.findById(payload.id);

    if (!doctor) {
      throw new NotFoundError('Doctor');
    }

    if (doctor.refreshToken !== refreshToken) {
      throw new ValidationError(AuthenticationErrors.INVALID_REFRESH_TOKEN);
    }

    await this.doctorRepository.updateRefreshToken(doctor.id, null);
  }
}


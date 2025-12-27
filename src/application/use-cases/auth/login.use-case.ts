import { injectable, inject } from 'tsyringe';
import { IDoctorRepository } from '../../../domain/repositories/doctor.repository';
import { IStaffRepository } from '../../../domain/repositories/staff.repository';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { IPasswordService } from '../../interfaces/password-service.interface';
import { IJwtService } from '../../interfaces/jwt-service.interface';
import { ILoginUseCase } from '../../interfaces/use-cases/auth/auth-use-cases.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { ValidationError } from '../../../domain/errors/validation.error';
import { AuthenticationErrors } from '../../../infrastructure/constants/error-messages';

@injectable()
export class LoginUseCase implements ILoginUseCase {
  constructor(
    @inject('IDoctorRepository') private doctorRepository: IDoctorRepository,
    @inject('IStaffRepository') private staffRepository: IStaffRepository,
    @inject('IClinicRepository') private clinicRepository: IClinicRepository,
    @inject('IPasswordService') private passwordService: IPasswordService,
    @inject('IJwtService') private jwtService: IJwtService
  ) {}

  async execute(params: {
    role?: 'doctor' | 'staff';
    email?: string;
    username?: string;
    password: string;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string; role: 'doctor' | 'staff'; clinicId?: string; doctorId?: string; clinicName?: string };
  }> {
    const role = params.role || 'doctor';
    if (role === 'staff') {
      if (!params.username) {
        throw new ValidationError('username is required for staff login');
      }
      const staff = await this.staffRepository.findByUsername(params.username);
      if (!staff) {
        throw new NotFoundError('Staff');
      }
      if (!staff.isActive) {
        throw new ValidationError(AuthenticationErrors.INVALID_CREDENTIALS);
      }
      const isPasswordValid = await this.passwordService.compare(params.password, staff.password);
      if (!isPasswordValid) {
        throw new ValidationError(AuthenticationErrors.INVALID_CREDENTIALS);
      }
      const clinic = staff.clinicId ? await this.clinicRepository.findById(staff.clinicId) : null;
      const clinicName = clinic?.name;
      const payload = {
        id: staff.id,
        email: staff.username,
        role: 'staff' as const,
        clinicId: staff.clinicId,
        doctorId: staff.doctorId,
      };
      const accessToken = this.jwtService.generateAccessToken(payload);
      const refreshToken = this.jwtService.generateRefreshToken(payload);
      await this.staffRepository.updateRefreshToken(staff.id, refreshToken);
      return {
        accessToken,
        refreshToken,
        user: {
          id: staff.id,
          email: staff.username,
          role: 'staff',
          clinicId: staff.clinicId,
          doctorId: staff.doctorId,
          clinicName,
        },
      };
    }

    if (!params.email) {
      throw new ValidationError('email is required for doctor login');
    }

    const doctor = await this.doctorRepository.findByEmail(params.email);

    if (!doctor) {
      throw new NotFoundError('Doctor');
    }

    const isPasswordValid = await this.passwordService.compare(params.password, doctor.password);

    if (!isPasswordValid) {
      throw new ValidationError(AuthenticationErrors.INVALID_CREDENTIALS);
    }

    const payload = {
      id: doctor.id,
      email: doctor.email.toString(),
      role: 'doctor' as const,
    };

    const accessToken = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    await this.doctorRepository.updateRefreshToken(doctor.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: doctor.id,
        email: doctor.email.toString(),
        role: 'doctor',
      },
    };
  }
}


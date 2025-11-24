import { injectable, inject } from 'tsyringe';
import { IDoctorRepository } from '../../../domain/repositories/doctor.repository';
import { IPasswordService } from '../../interfaces/password-service.interface';
import { IJwtService } from '../../interfaces/jwt-service.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { ValidationError } from '../../../domain/errors/validation.error';
import { AuthenticationErrors } from '../../../infrastructure/constants/error-messages';

@injectable()
export class LoginUseCase {
  constructor(
    @inject('IDoctorRepository') private doctorRepository: IDoctorRepository,
    @inject('IPasswordService') private passwordService: IPasswordService,
    @inject('IJwtService') private jwtService: IJwtService
  ) {}

  async execute(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: { id: string; email: string } }> {
    const doctor = await this.doctorRepository.findByEmail(email);

    if (!doctor) {
      throw new NotFoundError('Doctor');
    }

    const isPasswordValid = await this.passwordService.compare(password, doctor.password);

    if (!isPasswordValid) {
      throw new ValidationError(AuthenticationErrors.INVALID_CREDENTIALS);
    }

    const payload = {
      id: doctor.id,
      email: doctor.email.toString(),
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
      },
    };
  }
}


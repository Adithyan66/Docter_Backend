import { injectable, inject } from 'tsyringe';
import { IDoctorRepository } from '../../../domain/repositories/doctor.repository';
import { IJwtService } from '../../interfaces/jwt-service.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { ValidationError } from '../../../domain/errors/validation.error';
import { AuthenticationErrors } from '../../../infrastructure/constants/error-messages';

@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject('IDoctorRepository') private doctorRepository: IDoctorRepository,
    @inject('IJwtService') private jwtService: IJwtService
  ) {}

  async execute(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload;
    try {
      payload = this.jwtService.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new ValidationError(AuthenticationErrors.INVALID_REFRESH_TOKEN);
    }

    const doctor = await this.doctorRepository.findById(payload.id);

    if (!doctor) {
      throw new NotFoundError('Doctor');
    }

    if (doctor.refreshToken !== refreshToken) {
      throw new ValidationError(AuthenticationErrors.INVALID_REFRESH_TOKEN);
    }

    const tokenPayload = {
      id: doctor.id,
      email: doctor.email.toString(),
    };

    const accessToken = this.jwtService.generateAccessToken(tokenPayload);

    return { accessToken, refreshToken };
  }
}


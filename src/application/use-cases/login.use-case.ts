import { injectable, inject } from 'tsyringe';
import { DoctorRepository } from '../../domain/repositories/doctor.repository';
import { PasswordService } from '../../infrastructure/shared/password.service';
import { JwtService } from '../../infrastructure/shared/jwt.service';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { ValidationError } from '../../domain/errors/validation.error';
import { AuthenticationErrors } from '../../infrastructure/constants/error-messages';

@injectable()
export class LoginUseCase {
  constructor(
    @inject('DoctorRepository') private doctorRepository: DoctorRepository,
    @inject('PasswordService') private passwordService: PasswordService,
    @inject('JwtService') private jwtService: JwtService
  ) {}

  async execute(email: string, password: string): Promise<{ token: string }> {
    const doctor = await this.doctorRepository.findByEmail(email);

    if (!doctor) {
      throw new NotFoundError('Doctor');
    }

    const isPasswordValid = await this.passwordService.compare(password, doctor.password);

    if (!isPasswordValid) {
      throw new ValidationError(AuthenticationErrors.INVALID_CREDENTIALS);
    }

    const token = this.jwtService.generate({
      id: doctor.id,
      email: doctor.email.toString(),
    });

    return { token };
  }
}


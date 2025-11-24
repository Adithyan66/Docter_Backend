import 'reflect-metadata';
import { container } from 'tsyringe';
import { IDoctorRepository } from '../domain/repositories/doctor.repository';
import { MongoDoctorRepository } from '../infrastructure/repositories/mongodb/doctor.repository';
import { PasswordService } from '../infrastructure/shared/password.service';
import { JwtService } from '../infrastructure/shared/jwt.service';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { IPasswordService } from '../application/interfaces/password-service.interface';
import { IJwtService } from '../application/interfaces/jwt-service.interface';
import { AuthMiddleware } from '../presentation/middleware/auth.middleware';

container.registerSingleton<IDoctorRepository>('IDoctorRepository', MongoDoctorRepository);

container.registerSingleton<IPasswordService>('IPasswordService', PasswordService);

container.registerSingleton<IJwtService>('IJwtService', JwtService);

container.registerSingleton<LoginUseCase>('LoginUseCase', LoginUseCase);

container.registerSingleton<RefreshTokenUseCase>('RefreshTokenUseCase', RefreshTokenUseCase);

container.registerSingleton<LogoutUseCase>('LogoutUseCase', LogoutUseCase);

container.registerSingleton<AuthMiddleware>('AuthMiddleware', AuthMiddleware);

export { container };
export default container;

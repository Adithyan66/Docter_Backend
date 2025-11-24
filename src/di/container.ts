import 'reflect-metadata';
import { container } from 'tsyringe';
import { IDoctorRepository } from '../domain/repositories/doctor.repository';
import { MongoDoctorRepository } from '../infrastructure/repositories/mongodb/doctor.repository';
import { PasswordService } from '../infrastructure/shared/password.service';
import { JwtService } from '../infrastructure/shared/jwt.service';
import { S3Service } from '../infrastructure/shared/s3.service';
import { ImageUploadService } from '../infrastructure/shared/image-upload.service';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { GenerateImageUploadUrlUseCase } from '../application/use-cases/generate-image-upload-url.use-case';
import { IPasswordService } from '../application/interfaces/password-service.interface';
import { IJwtService } from '../application/interfaces/jwt-service.interface';
import { IS3Service } from '../application/interfaces/s3-service.interface';
import { IImageUploadService } from '../application/interfaces/image-upload-service.interface';
import { IGenerateImageUploadUrlUseCase } from '../application/interfaces/generate-image-upload-url-use-case.interface';
import { ImageServiceController } from '../presentation/controllers/image-service.controller';
import { AuthMiddleware } from '../presentation/middleware/auth.middleware';

container.registerSingleton<IDoctorRepository>('IDoctorRepository', MongoDoctorRepository);

container.registerSingleton<IPasswordService>('IPasswordService', PasswordService);

container.registerSingleton<IJwtService>('IJwtService', JwtService);

container.registerSingleton<IS3Service>('IS3Service', S3Service);

container.registerSingleton<IImageUploadService>('IImageUploadService', ImageUploadService);

container.registerSingleton<LoginUseCase>('LoginUseCase', LoginUseCase);

container.registerSingleton<RefreshTokenUseCase>('RefreshTokenUseCase', RefreshTokenUseCase);

container.registerSingleton<LogoutUseCase>('LogoutUseCase', LogoutUseCase);

container.registerSingleton<IGenerateImageUploadUrlUseCase>('IGenerateImageUploadUrlUseCase', GenerateImageUploadUrlUseCase);

container.registerSingleton<ImageServiceController>('ImageServiceController', ImageServiceController);

container.registerSingleton<AuthMiddleware>('AuthMiddleware', AuthMiddleware);

export { container };
export default container;

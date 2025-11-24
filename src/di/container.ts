import 'reflect-metadata';
import { container } from 'tsyringe';
import { IDoctorRepository } from '../domain/repositories/doctor.repository';
import { MongoDoctorRepository } from '../infrastructure/repositories/mongodb/doctor.repository';
import { ITreatmentRepository } from '../domain/repositories/treatment.repository';
import { MongoTreatmentRepository } from '../infrastructure/repositories/mongodb/treatment.repository';
import { PasswordService } from '../infrastructure/shared/password.service';
import { JwtService } from '../infrastructure/shared/jwt.service';
import { S3Service } from '../infrastructure/shared/s3.service';
import { ImageUploadService } from '../infrastructure/shared/image-upload.service';
import { LoginUseCase } from '../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../application/use-cases/auth/logout.use-case';
import { GenerateImageUploadUrlUseCase } from '../application/use-cases/image/generate-image-upload-url.use-case';
import { CreateTreatmentUseCase } from '../application/use-cases/treatment/create-treatment.use-case';
import { UpdateTreatmentUseCase } from '../application/use-cases/treatment/update-treatment.use-case';
import { DeleteTreatmentUseCase } from '../application/use-cases/treatment/delete-treatment.use-case';
import { GetTreatmentUseCase } from '../application/use-cases/treatment/get-treatment.use-case';
import { GetAllTreatmentsUseCase } from '../application/use-cases/treatment/get-all-treatments.use-case';
import { IPasswordService } from '../application/interfaces/password-service.interface';
import { IJwtService } from '../application/interfaces/jwt-service.interface';
import { IS3Service } from '../application/interfaces/s3-service.interface';
import { IImageUploadService } from '../application/interfaces/image-upload-service.interface';
import { IGenerateImageUploadUrlUseCase } from '../application/interfaces/generate-image-upload-url-use-case.interface';
import { ImageServiceController } from '../presentation/controllers/image-service.controller';
import { TreatmentController } from '../presentation/controllers/treatment.controller';
import { AuthMiddleware } from '../presentation/middleware/auth.middleware';

container.registerSingleton<IDoctorRepository>('IDoctorRepository', MongoDoctorRepository);

container.registerSingleton<ITreatmentRepository>('ITreatmentRepository', MongoTreatmentRepository);

container.registerSingleton<IPasswordService>('IPasswordService', PasswordService);

container.registerSingleton<IJwtService>('IJwtService', JwtService);

container.registerSingleton<IS3Service>('IS3Service', S3Service);

container.registerSingleton<IImageUploadService>('IImageUploadService', ImageUploadService);

container.registerSingleton<LoginUseCase>('LoginUseCase', LoginUseCase);

container.registerSingleton<RefreshTokenUseCase>('RefreshTokenUseCase', RefreshTokenUseCase);

container.registerSingleton<LogoutUseCase>('LogoutUseCase', LogoutUseCase);

container.registerSingleton<IGenerateImageUploadUrlUseCase>('IGenerateImageUploadUrlUseCase', GenerateImageUploadUrlUseCase);

container.registerSingleton<CreateTreatmentUseCase>('CreateTreatmentUseCase', CreateTreatmentUseCase);

container.registerSingleton<UpdateTreatmentUseCase>('UpdateTreatmentUseCase', UpdateTreatmentUseCase);

container.registerSingleton<DeleteTreatmentUseCase>('DeleteTreatmentUseCase', DeleteTreatmentUseCase);

container.registerSingleton<GetTreatmentUseCase>('GetTreatmentUseCase', GetTreatmentUseCase);

container.registerSingleton<GetAllTreatmentsUseCase>('GetAllTreatmentsUseCase', GetAllTreatmentsUseCase);

container.registerSingleton<ImageServiceController>('ImageServiceController', ImageServiceController);

container.registerSingleton<TreatmentController>('TreatmentController', TreatmentController);

container.registerSingleton<AuthMiddleware>('AuthMiddleware', AuthMiddleware);

export { container };
export default container;

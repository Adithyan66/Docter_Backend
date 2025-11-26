import 'reflect-metadata';
import { container } from 'tsyringe';
import { IDoctorRepository } from '../domain/repositories/doctor.repository';
import { MongoDoctorRepository } from '../infrastructure/repositories/mongodb/doctor.repository';
import { ITreatmentRepository } from '../domain/repositories/treatment.repository';
import { MongoTreatmentRepository } from '../infrastructure/repositories/mongodb/treatment.repository';
import { IClinicRepository } from '../domain/repositories/clinic.repository';
import { MongoClinicRepository } from '../infrastructure/repositories/mongodb/clinic.repository';
import { IPatientRepository } from '../domain/repositories/patient.repository';
import { MongoPatientRepository } from '../infrastructure/repositories/mongodb/patient.repository';
import { IPatientIdCounterRepository } from '../domain/repositories/patient-id-counter.repository';
import { MongoPatientIdCounterRepository } from '../infrastructure/repositories/mongodb/patient-id-counter.repository';
import { ITreatmentCourseRepository } from '../domain/repositories/treatment-course.repository';
import { MongoTreatmentCourseRepository } from '../infrastructure/repositories/mongodb/treatment-course.repository';
import { IVisitRepository } from '../domain/repositories/visit.repository';
import { MongoVisitRepository } from '../infrastructure/repositories/mongodb/visit.repository';
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
import { GetTreatmentNamesUseCase } from '../application/use-cases/treatment/get-treatment-names.use-case';
import { CreateClinicUseCase } from '../application/use-cases/clinic/create-clinic.use-case';
import { UpdateClinicUseCase } from '../application/use-cases/clinic/update-clinic.use-case';
import { DeleteClinicUseCase } from '../application/use-cases/clinic/delete-clinic.use-case';
import { GetClinicUseCase } from '../application/use-cases/clinic/get-clinic.use-case';
import { GetAllClinicsUseCase } from '../application/use-cases/clinic/get-all-clinics.use-case';
import { GetClinicNamesUseCase } from '../application/use-cases/clinic/get-clinic-names.use-case';
import { CreatePatientUseCase } from '../application/use-cases/patient/create-patient.use-case';
import { UpdatePatientUseCase } from '../application/use-cases/patient/update-patient.use-case';
import { DeletePatientUseCase } from '../application/use-cases/patient/delete-patient.use-case';
import { GetPatientsUseCase } from '../application/use-cases/patient/get-patients.use-case';
import { GetPatientUseCase } from '../application/use-cases/patient/get-patient.use-case';
import { CreateTreatmentCourseUseCase } from '../application/use-cases/treatment-course/create-treatment-course.use-case';
import { UpdateTreatmentCourseUseCase } from '../application/use-cases/treatment-course/update-treatment-course.use-case';
import { DeleteTreatmentCourseUseCase } from '../application/use-cases/treatment-course/delete-treatment-course.use-case';
import { GetTreatmentCourseUseCase } from '../application/use-cases/treatment-course/get-treatment-course.use-case';
import { GetAllTreatmentCoursesUseCase } from '../application/use-cases/treatment-course/get-all-treatment-courses.use-case';
import { CreateVisitUseCase } from '../application/use-cases/visit/create-visit.use-case';
import { UpdateVisitUseCase } from '../application/use-cases/visit/update-visit.use-case';
import { DeleteVisitUseCase } from '../application/use-cases/visit/delete-visit.use-case';
import { GetVisitUseCase } from '../application/use-cases/visit/get-visit.use-case';
import { GetAllVisitsUseCase } from '../application/use-cases/visit/get-all-visits.use-case';
import { IPasswordService } from '../application/interfaces/password-service.interface';
import { IJwtService } from '../application/interfaces/jwt-service.interface';
import { IS3Service } from '../application/interfaces/s3-service.interface';
import { IImageUploadService } from '../application/interfaces/image-upload-service.interface';
import { IGenerateImageUploadUrlUseCase } from '../application/interfaces/generate-image-upload-url-use-case.interface';
import { ImageServiceController } from '../presentation/controllers/image-service.controller';
import { TreatmentController } from '../presentation/controllers/treatment.controller';
import { ClinicController } from '../presentation/controllers/clinic.controller';
import { PatientController } from '../presentation/controllers/patient.controller';
import { TreatmentCourseController } from '../presentation/controllers/treatment-course.controller';
import { VisitController } from '../presentation/controllers/visit.controller';
import { AuthMiddleware } from '../presentation/middleware/auth.middleware';

container.registerSingleton<IDoctorRepository>('IDoctorRepository', MongoDoctorRepository);

container.registerSingleton<ITreatmentRepository>('ITreatmentRepository', MongoTreatmentRepository);

container.registerSingleton<IClinicRepository>('IClinicRepository', MongoClinicRepository);

container.registerSingleton<IPatientRepository>('IPatientRepository', MongoPatientRepository);
container.registerSingleton<IPatientIdCounterRepository>('IPatientIdCounterRepository', MongoPatientIdCounterRepository);
container.registerSingleton<ITreatmentCourseRepository>('ITreatmentCourseRepository', MongoTreatmentCourseRepository);
container.registerSingleton<IVisitRepository>('IVisitRepository', MongoVisitRepository);

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

container.registerSingleton<GetTreatmentNamesUseCase>('GetTreatmentNamesUseCase', GetTreatmentNamesUseCase);

container.registerSingleton<CreateClinicUseCase>('CreateClinicUseCase', CreateClinicUseCase);

container.registerSingleton<UpdateClinicUseCase>('UpdateClinicUseCase', UpdateClinicUseCase);

container.registerSingleton<DeleteClinicUseCase>('DeleteClinicUseCase', DeleteClinicUseCase);

container.registerSingleton<GetClinicUseCase>('GetClinicUseCase', GetClinicUseCase);

container.registerSingleton<GetAllClinicsUseCase>('GetAllClinicsUseCase', GetAllClinicsUseCase);

container.registerSingleton<GetClinicNamesUseCase>('GetClinicNamesUseCase', GetClinicNamesUseCase);

container.registerSingleton<CreatePatientUseCase>('CreatePatientUseCase', CreatePatientUseCase);
container.registerSingleton<UpdatePatientUseCase>('UpdatePatientUseCase', UpdatePatientUseCase);
container.registerSingleton<DeletePatientUseCase>('DeletePatientUseCase', DeletePatientUseCase);
container.registerSingleton<GetPatientsUseCase>('GetPatientsUseCase', GetPatientsUseCase);
container.registerSingleton<GetPatientUseCase>('GetPatientUseCase', GetPatientUseCase);

container.registerSingleton<CreateTreatmentCourseUseCase>('CreateTreatmentCourseUseCase', CreateTreatmentCourseUseCase);
container.registerSingleton<UpdateTreatmentCourseUseCase>('UpdateTreatmentCourseUseCase', UpdateTreatmentCourseUseCase);
container.registerSingleton<DeleteTreatmentCourseUseCase>('DeleteTreatmentCourseUseCase', DeleteTreatmentCourseUseCase);
container.registerSingleton<GetTreatmentCourseUseCase>('GetTreatmentCourseUseCase', GetTreatmentCourseUseCase);
container.registerSingleton<GetAllTreatmentCoursesUseCase>('GetAllTreatmentCoursesUseCase', GetAllTreatmentCoursesUseCase);

container.registerSingleton<CreateVisitUseCase>('CreateVisitUseCase', CreateVisitUseCase);
container.registerSingleton<UpdateVisitUseCase>('UpdateVisitUseCase', UpdateVisitUseCase);
container.registerSingleton<DeleteVisitUseCase>('DeleteVisitUseCase', DeleteVisitUseCase);
container.registerSingleton<GetVisitUseCase>('GetVisitUseCase', GetVisitUseCase);
container.registerSingleton<GetAllVisitsUseCase>('GetAllVisitsUseCase', GetAllVisitsUseCase);

container.registerSingleton<ImageServiceController>('ImageServiceController', ImageServiceController);

container.registerSingleton<TreatmentController>('TreatmentController', TreatmentController);

container.registerSingleton<ClinicController>('ClinicController', ClinicController);
container.registerSingleton<PatientController>('PatientController', PatientController);
container.registerSingleton<TreatmentCourseController>('TreatmentCourseController', TreatmentCourseController);
container.registerSingleton<VisitController>('VisitController', VisitController);

container.registerSingleton<AuthMiddleware>('AuthMiddleware', AuthMiddleware);

export { container };
export default container;

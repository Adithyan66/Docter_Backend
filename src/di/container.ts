import 'reflect-metadata';
import { container } from 'tsyringe';
import { IDoctorRepository } from '../domain/repositories/doctor.repository';
import { MongoDoctorRepository } from '../infrastructure/repositories/mongodb/doctor.repository';
import { IStaffRepository } from '../domain/repositories/staff.repository';
import { MongoStaffRepository } from '../infrastructure/repositories/mongodb/staff.repository';
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
import { IPaymentRepository } from '../domain/repositories/payment.repository';
import { MongoPaymentRepository } from '../infrastructure/repositories/mongodb/payment.repository';
import { IPrescriptionRepository } from '../domain/repositories/prescription.repository';
import { MongoPrescriptionRepository } from '../infrastructure/repositories/mongodb/prescription.repository';
import { IMediaRepository } from '../domain/repositories/media.repository';
import { MongoMediaRepository } from '../infrastructure/repositories/mongodb/media.repository';
import { ICalendarEntryRepository } from '../domain/repositories/calendar-entry.repository';
import { MongoCalendarEntryRepository } from '../infrastructure/repositories/mongodb/calendar-entry.repository';
import { PasswordService } from '../infrastructure/shared/password.service';
import { JwtService } from '../infrastructure/shared/jwt.service';
import { GcpStorageAdapter } from '../infrastructure/shared/adapters/gcp-storage.adapter';
import { ImageUploadService } from '../infrastructure/shared/image-upload.service';
import { LoginUseCase } from '../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../application/use-cases/auth/logout.use-case';
import { ILoginUseCase, IRefreshTokenUseCase, ILogoutUseCase } from '../application/interfaces/use-cases/auth/auth-use-cases.interface';
import { GenerateImageUploadUrlUseCase } from '../application/use-cases/image/generate-image-upload-url.use-case';
import { GenerateImageDownloadUrlUseCase } from '../application/use-cases/image/generate-image-download-url.use-case';
import { IGenerateImageUploadUrlUseCase, IGenerateImageDownloadUrlUseCase } from '../application/interfaces/use-cases/image/image-use-cases.interface';
import { CreateTreatmentUseCase } from '../application/use-cases/treatment/create-treatment.use-case';
import { UpdateTreatmentUseCase } from '../application/use-cases/treatment/update-treatment.use-case';
import { DeleteTreatmentUseCase } from '../application/use-cases/treatment/delete-treatment.use-case';
import { GetTreatmentUseCase } from '../application/use-cases/treatment/get-treatment.use-case';
import { GetAllTreatmentsUseCase } from '../application/use-cases/treatment/get-all-treatments.use-case';
import { GetTreatmentNamesUseCase } from '../application/use-cases/treatment/get-treatment-names.use-case';
import { AddTreatmentImagesUseCase } from '../application/use-cases/treatment/add-treatment-images.use-case';
import { GetTreatmentImagesUseCase } from '../application/use-cases/treatment/get-treatment-images.use-case';
import { DeleteTreatmentImageUseCase } from '../application/use-cases/treatment/delete-treatment-image.use-case';
import {
  ICreateTreatmentUseCase,
  IUpdateTreatmentUseCase,
  IDeleteTreatmentUseCase,
  IGetTreatmentUseCase,
  IGetAllTreatmentsUseCase,
  IGetTreatmentNamesUseCase,
  IAddTreatmentImagesUseCase,
  IGetTreatmentImagesUseCase,
  IDeleteTreatmentImageUseCase,
} from '../application/interfaces/use-cases/treatment/treatment-use-cases.interface';
import { CreateClinicUseCase } from '../application/use-cases/clinic/create-clinic.use-case';
import { UpdateClinicUseCase } from '../application/use-cases/clinic/update-clinic.use-case';
import { DeleteClinicUseCase } from '../application/use-cases/clinic/delete-clinic.use-case';
import { GetClinicUseCase } from '../application/use-cases/clinic/get-clinic.use-case';
import { GetAllClinicsUseCase } from '../application/use-cases/clinic/get-all-clinics.use-case';
import { GetClinicNamesUseCase } from '../application/use-cases/clinic/get-clinic-names.use-case';
import { GetClinicImagesUseCase } from '../application/use-cases/clinic/get-clinic-images.use-case';
import { DeleteClinicImageUseCase } from '../application/use-cases/clinic/delete-clinic-image.use-case';
import { AddClinicImagesUseCase } from '../application/use-cases/clinic/add-clinic-images.use-case';
import {
  ICreateClinicUseCase,
  IUpdateClinicUseCase,
  IDeleteClinicUseCase,
  IGetClinicUseCase,
  IGetAllClinicsUseCase,
  IGetClinicNamesUseCase,
  IGetClinicImagesUseCase,
  IAddClinicImagesUseCase,
  IDeleteClinicImageUseCase,
} from '../application/interfaces/use-cases/clinic/clinic-use-cases.interface';
import { CreatePatientUseCase } from '../application/use-cases/patient/create-patient.use-case';
import { UpdatePatientUseCase } from '../application/use-cases/patient/update-patient.use-case';
import { DeletePatientUseCase } from '../application/use-cases/patient/delete-patient.use-case';
import { RestorePatientUseCase } from '../application/use-cases/patient/restore-patient.use-case';
import { GetPatientsUseCase } from '../application/use-cases/patient/get-patients.use-case';
import { GetPatientUseCase } from '../application/use-cases/patient/get-patient.use-case';
import {
  ICreatePatientUseCase,
  IUpdatePatientUseCase,
  IDeletePatientUseCase,
  IRestorePatientUseCase,
  IGetPatientsUseCase,
  IGetPatientUseCase,
} from '../application/interfaces/use-cases/patient/patient-use-cases.interface';
import { CreateTreatmentCourseUseCase } from '../application/use-cases/treatment-course/create-treatment-course.use-case';
import { UpdateTreatmentCourseUseCase } from '../application/use-cases/treatment-course/update-treatment-course.use-case';
import { DeleteTreatmentCourseUseCase } from '../application/use-cases/treatment-course/delete-treatment-course.use-case';
import { GetTreatmentCourseUseCase } from '../application/use-cases/treatment-course/get-treatment-course.use-case';
import { GetAllTreatmentCoursesUseCase } from '../application/use-cases/treatment-course/get-all-treatment-courses.use-case';
import {
  ICreateTreatmentCourseUseCase,
  IUpdateTreatmentCourseUseCase,
  IDeleteTreatmentCourseUseCase,
  IGetTreatmentCourseUseCase,
  IGetAllTreatmentCoursesUseCase,
} from '../application/interfaces/use-cases/treatment-course/treatment-course-use-cases.interface';
import { CreateVisitUseCase } from '../application/use-cases/visit/create-visit.use-case';
import { UpdateVisitUseCase } from '../application/use-cases/visit/update-visit.use-case';
import { DeleteVisitUseCase } from '../application/use-cases/visit/delete-visit.use-case';
import { GetVisitUseCase } from '../application/use-cases/visit/get-visit.use-case';
import { GetAllVisitsUseCase } from '../application/use-cases/visit/get-all-visits.use-case';
import { GetVisitRemindersUseCase } from '../application/use-cases/visit/get-visit-reminders.use-case';
import {
  ICreateVisitUseCase,
  IUpdateVisitUseCase,
  IDeleteVisitUseCase,
  IGetVisitUseCase,
  IGetAllVisitsUseCase,
  IGetVisitRemindersUseCase,
} from '../application/interfaces/use-cases/visit/visit-use-cases.interface';
import { GetDailyActivitiesUseCase } from '../application/use-cases/daily-activity/get-daily-activities.use-case';
import { IGetDailyActivitiesUseCase } from '../application/interfaces/use-cases/daily-activity/daily-activity-use-cases.interface';
import { CreateCalendarEntryUseCase } from '../application/use-cases/calendar-entry/create-calendar-entry.use-case';
import { UpdateCalendarEntryUseCase } from '../application/use-cases/calendar-entry/update-calendar-entry.use-case';
import { DeleteCalendarEntryUseCase } from '../application/use-cases/calendar-entry/delete-calendar-entry.use-case';
import { GetCalendarEntryUseCase } from '../application/use-cases/calendar-entry/get-calendar-entry.use-case';
import { AddAppointmentUseCase } from '../application/use-cases/calendar-entry/add-appointment.use-case';
import { UpdateAppointmentUseCase } from '../application/use-cases/calendar-entry/update-appointment.use-case';
import { ToggleAppointmentCompletedUseCase } from '../application/use-cases/calendar-entry/toggle-appointment-completed.use-case';
import { DeleteAppointmentUseCase } from '../application/use-cases/calendar-entry/delete-appointment.use-case';
import { GetAppointmentsUseCase } from '../application/use-cases/calendar-entry/get-appointments.use-case';
import { GetMonthlyCalendarUseCase } from '../application/use-cases/calendar-entry/get-monthly-calendar.use-case';
import { GetCalendarEntriesByDateUseCase } from '../application/use-cases/calendar-entry/get-calendar-entries-by-date.use-case';
import {
  ICreateCalendarEntryUseCase,
  IUpdateCalendarEntryUseCase,
  IDeleteCalendarEntryUseCase,
  IGetCalendarEntryUseCase,
  IAddAppointmentUseCase,
  IUpdateAppointmentUseCase,
  IToggleAppointmentCompletedUseCase,
  IDeleteAppointmentUseCase,
  IGetAppointmentsUseCase,
  IGetMonthlyCalendarUseCase,
  IGetCalendarEntriesByDateUseCase,
} from '../application/interfaces/use-cases/calendar-entry/calendar-entry-use-cases.interface';
import { CreatePaymentUseCase } from '../application/use-cases/payment/create-payment.use-case';
import { GetPaymentUseCase } from '../application/use-cases/payment/get-payment.use-case';
import { GetAllPaymentsUseCase } from '../application/use-cases/payment/get-all-payments.use-case';
import { RefundPaymentUseCase } from '../application/use-cases/payment/refund-payment.use-case';
import {
  ICreatePaymentUseCase,
  IGetPaymentUseCase,
  IGetAllPaymentsUseCase,
  IRefundPaymentUseCase,
} from '../application/interfaces/use-cases/payment/payment-use-cases.interface';
import { CreatePrescriptionUseCase } from '../application/use-cases/prescription/create-prescription.use-case';
import { GetPrescriptionUseCase } from '../application/use-cases/prescription/get-prescription.use-case';
import { GetAllPrescriptionsUseCase } from '../application/use-cases/prescription/get-all-prescriptions.use-case';
import { UpdatePrescriptionUseCase } from '../application/use-cases/prescription/update-prescription.use-case';
import { DeletePrescriptionUseCase } from '../application/use-cases/prescription/delete-prescription.use-case';
import {
  ICreatePrescriptionUseCase,
  IGetPrescriptionUseCase,
  IGetAllPrescriptionsUseCase,
  IUpdatePrescriptionUseCase,
  IDeletePrescriptionUseCase,
} from '../application/interfaces/use-cases/prescription/prescription-use-cases.interface';
import { CreateMediaUseCase } from '../application/use-cases/media/create-media.use-case';
import { GetMediaUseCase } from '../application/use-cases/media/get-media.use-case';
import { GetAllMediaUseCase } from '../application/use-cases/media/get-all-media.use-case';
import { UpdateMediaUseCase } from '../application/use-cases/media/update-media.use-case';
import { DeleteMediaUseCase } from '../application/use-cases/media/delete-media.use-case';
import {
  ICreateMediaUseCase,
  IUpdateMediaUseCase,
  IDeleteMediaUseCase,
  IGetMediaUseCase,
  IGetAllMediaUseCase,
} from '../application/interfaces/use-cases/media/media-use-cases.interface';
import { IExecuteBackupUseCase } from '../application/interfaces/use-cases/backup/backup-use-cases.interface';
import { ExecuteBackupUseCase } from '../application/use-cases/backup/execute-backup.use-case';
import { IBackupService } from '../domain/services/backup-service.interface';
import { IGoogleDriveService } from '../domain/services/google-drive-service.interface';
import { ISchedulerService } from '../domain/services/scheduler-service.interface';
import { MongoDbDumpService } from '../infrastructure/shared/mongodb-dump.service';
import { GoogleDriveService } from '../infrastructure/shared/google-drive.service';
import { BackupSchedulerService } from '../infrastructure/shared/backup-scheduler.service';
import { IPasswordService } from '../application/interfaces/password-service.interface';
import { IJwtService } from '../application/interfaces/jwt-service.interface';
import { IFileStorageService } from '../application/interfaces/file-storage-service.interface';
import { IImageUploadService } from '../application/interfaces/image-upload-service.interface';
import { ImageServiceController } from '../presentation/controllers/image-service.controller';
import { TreatmentController } from '../presentation/controllers/treatment.controller';
import { ClinicController } from '../presentation/controllers/clinic.controller';
import { PatientController } from '../presentation/controllers/patient.controller';
import { TreatmentCourseController } from '../presentation/controllers/treatment-course.controller';
import { VisitController } from '../presentation/controllers/visit.controller';
import { DailyActivityController } from '../presentation/controllers/daily-activity.controller';
import { PaymentController } from '../presentation/controllers/payment.controller';
import { PrescriptionController } from '../presentation/controllers/prescription.controller';
import { MediaController } from '../presentation/controllers/media.controller';
import { StaffController } from '../presentation/controllers/staff.controller';
import { CalendarEntryController } from '../presentation/controllers/calendar-entry.controller';
import { AuthController } from '../presentation/controllers/auth.controller';
import { AuthMiddleware } from '../presentation/middleware/auth.middleware';
import { GetFinancialDashboardUseCase } from '../application/use-cases/analytics/get-financial-dashboard.use-case';
import { IGetFinancialDashboardUseCase } from '../application/interfaces/use-cases/analytics/analytics-use-cases.interface';
import { AnalyticsController } from '../presentation/controllers/analytics.controller';
import { CreateStaffUseCase } from '../application/use-cases/staff/create-staff.use-case';
import { UpdateStaffUseCase } from '../application/use-cases/staff/update-staff.use-case';
import { DeleteStaffUseCase } from '../application/use-cases/staff/delete-staff.use-case';
import { GetStaffUseCase } from '../application/use-cases/staff/get-staff.use-case';
import { GetAllStaffUseCase } from '../application/use-cases/staff/get-all-staff.use-case';
import {
  ICreateStaffUseCase,
  IUpdateStaffUseCase,
  IDeleteStaffUseCase,
  IGetStaffUseCase,
  IGetAllStaffUseCase,
} from '../application/interfaces/use-cases/staff/staff-use-cases.interface';

container.registerSingleton<IDoctorRepository>('IDoctorRepository', MongoDoctorRepository);
container.registerSingleton<IStaffRepository>('IStaffRepository', MongoStaffRepository);

container.registerSingleton<ITreatmentRepository>('ITreatmentRepository', MongoTreatmentRepository);

container.registerSingleton<IClinicRepository>('IClinicRepository', MongoClinicRepository);

container.registerSingleton<IPatientRepository>('IPatientRepository', MongoPatientRepository);
container.registerSingleton<IPatientIdCounterRepository>('IPatientIdCounterRepository', MongoPatientIdCounterRepository);
container.registerSingleton<ITreatmentCourseRepository>('ITreatmentCourseRepository', MongoTreatmentCourseRepository);
container.registerSingleton<IVisitRepository>('IVisitRepository', MongoVisitRepository);
container.registerSingleton<IPaymentRepository>('IPaymentRepository', MongoPaymentRepository);
container.registerSingleton<IPrescriptionRepository>('IPrescriptionRepository', MongoPrescriptionRepository);
container.registerSingleton<IMediaRepository>('IMediaRepository', MongoMediaRepository);
container.registerSingleton<ICalendarEntryRepository>('ICalendarEntryRepository', MongoCalendarEntryRepository);

container.registerSingleton<IPasswordService>('IPasswordService', PasswordService);

container.registerSingleton<IJwtService>('IJwtService', JwtService);

container.registerSingleton<IFileStorageService>('IFileStorageService', GcpStorageAdapter);

container.registerSingleton<IImageUploadService>('IImageUploadService', ImageUploadService);

container.registerSingleton<ILoginUseCase>('ILoginUseCase', LoginUseCase);

container.registerSingleton<IRefreshTokenUseCase>('IRefreshTokenUseCase', RefreshTokenUseCase);

container.registerSingleton<ILogoutUseCase>('ILogoutUseCase', LogoutUseCase);
container.registerSingleton<ICreateStaffUseCase>('ICreateStaffUseCase', CreateStaffUseCase);
container.registerSingleton<IUpdateStaffUseCase>('IUpdateStaffUseCase', UpdateStaffUseCase);
container.registerSingleton<IDeleteStaffUseCase>('IDeleteStaffUseCase', DeleteStaffUseCase);
container.registerSingleton<IGetStaffUseCase>('IGetStaffUseCase', GetStaffUseCase);
container.registerSingleton<IGetAllStaffUseCase>('IGetAllStaffUseCase', GetAllStaffUseCase);

container.registerSingleton<IGenerateImageUploadUrlUseCase>('IGenerateImageUploadUrlUseCase', GenerateImageUploadUrlUseCase);

container.registerSingleton<IGenerateImageDownloadUrlUseCase>('IGenerateImageDownloadUrlUseCase', GenerateImageDownloadUrlUseCase);

container.registerSingleton<ICreateTreatmentUseCase>('ICreateTreatmentUseCase', CreateTreatmentUseCase);

container.registerSingleton<IUpdateTreatmentUseCase>('IUpdateTreatmentUseCase', UpdateTreatmentUseCase);

container.registerSingleton<IDeleteTreatmentUseCase>('IDeleteTreatmentUseCase', DeleteTreatmentUseCase);

container.registerSingleton<IGetTreatmentUseCase>('IGetTreatmentUseCase', GetTreatmentUseCase);

container.registerSingleton<IGetAllTreatmentsUseCase>('IGetAllTreatmentsUseCase', GetAllTreatmentsUseCase);

container.registerSingleton<IGetTreatmentNamesUseCase>('IGetTreatmentNamesUseCase', GetTreatmentNamesUseCase);

container.registerSingleton<IAddTreatmentImagesUseCase>('IAddTreatmentImagesUseCase', AddTreatmentImagesUseCase);

container.registerSingleton<IGetTreatmentImagesUseCase>('IGetTreatmentImagesUseCase', GetTreatmentImagesUseCase);

container.registerSingleton<IDeleteTreatmentImageUseCase>('IDeleteTreatmentImageUseCase', DeleteTreatmentImageUseCase);

container.registerSingleton<ICreateClinicUseCase>('ICreateClinicUseCase', CreateClinicUseCase);

container.registerSingleton<IUpdateClinicUseCase>('IUpdateClinicUseCase', UpdateClinicUseCase);

container.registerSingleton<IDeleteClinicUseCase>('IDeleteClinicUseCase', DeleteClinicUseCase);

container.registerSingleton<IGetClinicUseCase>('IGetClinicUseCase', GetClinicUseCase);

container.registerSingleton<IGetAllClinicsUseCase>('IGetAllClinicsUseCase', GetAllClinicsUseCase);

container.registerSingleton<IGetClinicNamesUseCase>('IGetClinicNamesUseCase', GetClinicNamesUseCase);

container.registerSingleton<IGetClinicImagesUseCase>('IGetClinicImagesUseCase', GetClinicImagesUseCase);

container.registerSingleton<IDeleteClinicImageUseCase>('IDeleteClinicImageUseCase', DeleteClinicImageUseCase);

container.registerSingleton<IAddClinicImagesUseCase>('IAddClinicImagesUseCase', AddClinicImagesUseCase);

container.registerSingleton<ICreatePatientUseCase>('ICreatePatientUseCase', CreatePatientUseCase);
container.registerSingleton<IUpdatePatientUseCase>('IUpdatePatientUseCase', UpdatePatientUseCase);
container.registerSingleton<IDeletePatientUseCase>('IDeletePatientUseCase', DeletePatientUseCase);
container.registerSingleton<IRestorePatientUseCase>('IRestorePatientUseCase', RestorePatientUseCase);
container.registerSingleton<IGetPatientsUseCase>('IGetPatientsUseCase', GetPatientsUseCase);
container.registerSingleton<IGetPatientUseCase>('IGetPatientUseCase', GetPatientUseCase);

container.registerSingleton<ICreateTreatmentCourseUseCase>('ICreateTreatmentCourseUseCase', CreateTreatmentCourseUseCase);
container.registerSingleton<IUpdateTreatmentCourseUseCase>('IUpdateTreatmentCourseUseCase', UpdateTreatmentCourseUseCase);
container.registerSingleton<IDeleteTreatmentCourseUseCase>('IDeleteTreatmentCourseUseCase', DeleteTreatmentCourseUseCase);
container.registerSingleton<IGetTreatmentCourseUseCase>('IGetTreatmentCourseUseCase', GetTreatmentCourseUseCase);
container.registerSingleton<IGetAllTreatmentCoursesUseCase>('IGetAllTreatmentCoursesUseCase', GetAllTreatmentCoursesUseCase);

container.registerSingleton<ICreateVisitUseCase>('ICreateVisitUseCase', CreateVisitUseCase);
container.registerSingleton<IUpdateVisitUseCase>('IUpdateVisitUseCase', UpdateVisitUseCase);
container.registerSingleton<IDeleteVisitUseCase>('IDeleteVisitUseCase', DeleteVisitUseCase);
container.registerSingleton<IGetVisitUseCase>('IGetVisitUseCase', GetVisitUseCase);
container.registerSingleton<IGetAllVisitsUseCase>('IGetAllVisitsUseCase', GetAllVisitsUseCase);
container.registerSingleton<IGetVisitRemindersUseCase>('IGetVisitRemindersUseCase', GetVisitRemindersUseCase);
container.registerSingleton<IGetDailyActivitiesUseCase>('IGetDailyActivitiesUseCase', GetDailyActivitiesUseCase);

container.registerSingleton<ICreateCalendarEntryUseCase>('ICreateCalendarEntryUseCase', CreateCalendarEntryUseCase);
container.registerSingleton<IUpdateCalendarEntryUseCase>('IUpdateCalendarEntryUseCase', UpdateCalendarEntryUseCase);
container.registerSingleton<IDeleteCalendarEntryUseCase>('IDeleteCalendarEntryUseCase', DeleteCalendarEntryUseCase);
container.registerSingleton<IGetCalendarEntryUseCase>('IGetCalendarEntryUseCase', GetCalendarEntryUseCase);
container.registerSingleton<IAddAppointmentUseCase>('IAddAppointmentUseCase', AddAppointmentUseCase);
container.registerSingleton<IUpdateAppointmentUseCase>('IUpdateAppointmentUseCase', UpdateAppointmentUseCase);
container.registerSingleton<IToggleAppointmentCompletedUseCase>('IToggleAppointmentCompletedUseCase', ToggleAppointmentCompletedUseCase);
container.registerSingleton<IDeleteAppointmentUseCase>('IDeleteAppointmentUseCase', DeleteAppointmentUseCase);
container.registerSingleton<IGetAppointmentsUseCase>('IGetAppointmentsUseCase', GetAppointmentsUseCase);
container.registerSingleton<IGetMonthlyCalendarUseCase>('IGetMonthlyCalendarUseCase', GetMonthlyCalendarUseCase);
container.registerSingleton<IGetCalendarEntriesByDateUseCase>('IGetCalendarEntriesByDateUseCase', GetCalendarEntriesByDateUseCase);

container.registerSingleton<ICreatePaymentUseCase>('ICreatePaymentUseCase', CreatePaymentUseCase);
container.registerSingleton<IGetPaymentUseCase>('IGetPaymentUseCase', GetPaymentUseCase);
container.registerSingleton<IGetAllPaymentsUseCase>('IGetAllPaymentsUseCase', GetAllPaymentsUseCase);
container.registerSingleton<IRefundPaymentUseCase>('IRefundPaymentUseCase', RefundPaymentUseCase);

container.registerSingleton<ICreatePrescriptionUseCase>('ICreatePrescriptionUseCase', CreatePrescriptionUseCase);
container.registerSingleton<IGetPrescriptionUseCase>('IGetPrescriptionUseCase', GetPrescriptionUseCase);
container.registerSingleton<IGetAllPrescriptionsUseCase>('IGetAllPrescriptionsUseCase', GetAllPrescriptionsUseCase);
container.registerSingleton<IUpdatePrescriptionUseCase>('IUpdatePrescriptionUseCase', UpdatePrescriptionUseCase);
container.registerSingleton<IDeletePrescriptionUseCase>('IDeletePrescriptionUseCase', DeletePrescriptionUseCase);

container.registerSingleton<ICreateMediaUseCase>('ICreateMediaUseCase', CreateMediaUseCase);
container.registerSingleton<IGetMediaUseCase>('IGetMediaUseCase', GetMediaUseCase);
container.registerSingleton<IGetAllMediaUseCase>('IGetAllMediaUseCase', GetAllMediaUseCase);
container.registerSingleton<IUpdateMediaUseCase>('IUpdateMediaUseCase', UpdateMediaUseCase);
container.registerSingleton<IDeleteMediaUseCase>('IDeleteMediaUseCase', DeleteMediaUseCase);

container.registerSingleton<IBackupService>('IBackupService', MongoDbDumpService);
container.registerSingleton<IGoogleDriveService>('IGoogleDriveService', GoogleDriveService);
container.registerSingleton<ISchedulerService>('ISchedulerService', BackupSchedulerService);
container.registerSingleton<IExecuteBackupUseCase>('IExecuteBackupUseCase', ExecuteBackupUseCase);

container.registerSingleton<ImageServiceController>('ImageServiceController', ImageServiceController);

container.registerSingleton<TreatmentController>('TreatmentController', TreatmentController);

container.registerSingleton<ClinicController>('ClinicController', ClinicController);
container.registerSingleton<PatientController>('PatientController', PatientController);
container.registerSingleton<TreatmentCourseController>('TreatmentCourseController', TreatmentCourseController);
container.registerSingleton<VisitController>('VisitController', VisitController);
container.registerSingleton<DailyActivityController>('DailyActivityController', DailyActivityController);
container.registerSingleton<PaymentController>('PaymentController', PaymentController);
container.registerSingleton<PrescriptionController>('PrescriptionController', PrescriptionController);
container.registerSingleton<MediaController>('MediaController', MediaController);
container.registerSingleton<StaffController>('StaffController', StaffController);
container.registerSingleton<CalendarEntryController>('CalendarEntryController', CalendarEntryController);
container.registerSingleton<AuthController>('AuthController', AuthController);

container.registerSingleton<AuthMiddleware>('AuthMiddleware', AuthMiddleware);

container.registerSingleton<IGetFinancialDashboardUseCase>('IGetFinancialDashboardUseCase', GetFinancialDashboardUseCase);

container.registerSingleton<AnalyticsController>('AnalyticsController', AnalyticsController);

export { container };
export default container;



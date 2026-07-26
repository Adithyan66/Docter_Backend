import { DependencyContainer } from 'tsyringe';

import { LoginUseCase } from '../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../application/use-cases/auth/logout.use-case';
import { GenerateImageUploadUrlUseCase } from '../application/use-cases/image/generate-image-upload-url.use-case';
import { GenerateImageDownloadUrlUseCase } from '../application/use-cases/image/generate-image-download-url.use-case';
import { CreateTreatmentUseCase } from '../application/use-cases/treatment/create-treatment.use-case';
import { UpdateTreatmentUseCase } from '../application/use-cases/treatment/update-treatment.use-case';
import { DeleteTreatmentUseCase } from '../application/use-cases/treatment/delete-treatment.use-case';
import { GetTreatmentUseCase } from '../application/use-cases/treatment/get-treatment.use-case';
import { GetAllTreatmentsUseCase } from '../application/use-cases/treatment/get-all-treatments.use-case';
import { GetTreatmentNamesUseCase } from '../application/use-cases/treatment/get-treatment-names.use-case';
import { AddTreatmentImagesUseCase } from '../application/use-cases/treatment/add-treatment-images.use-case';
import { GetTreatmentImagesUseCase } from '../application/use-cases/treatment/get-treatment-images.use-case';
import { DeleteTreatmentImageUseCase } from '../application/use-cases/treatment/delete-treatment-image.use-case';
import { CreateClinicUseCase } from '../application/use-cases/clinic/create-clinic.use-case';
import { UpdateClinicUseCase } from '../application/use-cases/clinic/update-clinic.use-case';
import { DeleteClinicUseCase } from '../application/use-cases/clinic/delete-clinic.use-case';
import { GetClinicUseCase } from '../application/use-cases/clinic/get-clinic.use-case';
import { GetAllClinicsUseCase } from '../application/use-cases/clinic/get-all-clinics.use-case';
import { GetClinicNamesUseCase } from '../application/use-cases/clinic/get-clinic-names.use-case';
import { GetClinicImagesUseCase } from '../application/use-cases/clinic/get-clinic-images.use-case';
import { DeleteClinicImageUseCase } from '../application/use-cases/clinic/delete-clinic-image.use-case';
import { AddClinicImagesUseCase } from '../application/use-cases/clinic/add-clinic-images.use-case';
import { CreatePatientUseCase } from '../application/use-cases/patient/create-patient.use-case';
import { UpdatePatientUseCase } from '../application/use-cases/patient/update-patient.use-case';
import { DeletePatientUseCase } from '../application/use-cases/patient/delete-patient.use-case';
import { RestorePatientUseCase } from '../application/use-cases/patient/restore-patient.use-case';
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
import { GetVisitRemindersUseCase } from '../application/use-cases/visit/get-visit-reminders.use-case';
import { GetDailyActivitiesUseCase } from '../application/use-cases/daily-activity/get-daily-activities.use-case';
import { CreatePaymentUseCase } from '../application/use-cases/payment/create-payment.use-case';
import { GetPaymentUseCase } from '../application/use-cases/payment/get-payment.use-case';
import { GetAllPaymentsUseCase } from '../application/use-cases/payment/get-all-payments.use-case';
import { RefundPaymentUseCase } from '../application/use-cases/payment/refund-payment.use-case';
import { CreatePrescriptionUseCase } from '../application/use-cases/prescription/create-prescription.use-case';
import { GetPrescriptionUseCase } from '../application/use-cases/prescription/get-prescription.use-case';
import { GetAllPrescriptionsUseCase } from '../application/use-cases/prescription/get-all-prescriptions.use-case';
import { UpdatePrescriptionUseCase } from '../application/use-cases/prescription/update-prescription.use-case';
import { DeletePrescriptionUseCase } from '../application/use-cases/prescription/delete-prescription.use-case';
import { CreateMediaUseCase } from '../application/use-cases/media/create-media.use-case';
import { GetMediaUseCase } from '../application/use-cases/media/get-media.use-case';
import { GetAllMediaUseCase } from '../application/use-cases/media/get-all-media.use-case';
import { UpdateMediaUseCase } from '../application/use-cases/media/update-media.use-case';
import { DeleteMediaUseCase } from '../application/use-cases/media/delete-media.use-case';
import { CreateStaffUseCase } from '../application/use-cases/staff/create-staff.use-case';
import { UpdateStaffUseCase } from '../application/use-cases/staff/update-staff.use-case';
import { DeleteStaffUseCase } from '../application/use-cases/staff/delete-staff.use-case';
import { GetStaffUseCase } from '../application/use-cases/staff/get-staff.use-case';
import { GetAllStaffUseCase } from '../application/use-cases/staff/get-all-staff.use-case';

import { ImageServiceController } from '../presentation/controllers/image-service.controller';
import { TreatmentController } from '../presentation/controllers/treatment.controller';
import { ClinicController } from '../presentation/controllers/clinic.controller';
import { PatientController } from '../presentation/controllers/patient.controller';
import { TreatmentCourseController } from '../presentation/controllers/treatment-course.controller';
import { VisitController } from '../presentation/controllers/visit.controller';
import { CalendarEntryController } from '../presentation/controllers/calendar-entry.controller';
import { AnalyticsController } from '../presentation/controllers/analytics.controller';
import { GetFinancialDashboardUseCase } from '../application/use-cases/analytics/get-financial-dashboard.use-case';
import { CreateCalendarEntryUseCase } from '../application/use-cases/calendar-entry/create-calendar-entry.use-case';
import { UpdateCalendarEntryUseCase } from '../application/use-cases/calendar-entry/update-calendar-entry.use-case';
import { DeleteCalendarEntryUseCase } from '../application/use-cases/calendar-entry/delete-calendar-entry.use-case';
import { GetCalendarEntryUseCase } from '../application/use-cases/calendar-entry/get-calendar-entry.use-case';
import { GetMonthlyCalendarUseCase } from '../application/use-cases/calendar-entry/get-monthly-calendar.use-case';
import { GetCalendarEntriesByDateUseCase } from '../application/use-cases/calendar-entry/get-calendar-entries-by-date.use-case';
import { AddAppointmentUseCase } from '../application/use-cases/calendar-entry/add-appointment.use-case';
import { UpdateAppointmentUseCase } from '../application/use-cases/calendar-entry/update-appointment.use-case';
import { DeleteAppointmentUseCase } from '../application/use-cases/calendar-entry/delete-appointment.use-case';
import { ToggleAppointmentCompletedUseCase } from '../application/use-cases/calendar-entry/toggle-appointment-completed.use-case';
import { GetAppointmentsUseCase } from '../application/use-cases/calendar-entry/get-appointments.use-case';
import { DailyActivityController } from '../presentation/controllers/daily-activity.controller';
import { PaymentController } from '../presentation/controllers/payment.controller';
import { PrescriptionController } from '../presentation/controllers/prescription.controller';
import { MediaController } from '../presentation/controllers/media.controller';
import { StaffController } from '../presentation/controllers/staff.controller';
import { AuthController } from '../presentation/controllers/auth.controller';
import { AuthMiddleware } from '../presentation/middleware/auth.middleware';

/**
 * Registers all storage-agnostic application-layer bindings (use-cases,
 * controllers, auth middleware). Repositories and infrastructure services
 * (jwt, password, storage) are container-specific and registered by the caller
 * before invoking this.
 */
export function registerAppLayer(c: DependencyContainer): void {
  c.register('ILoginUseCase', { useClass: LoginUseCase });
  c.register('IRefreshTokenUseCase', { useClass: RefreshTokenUseCase });
  c.register('ILogoutUseCase', { useClass: LogoutUseCase });

  c.register('ICreateStaffUseCase', { useClass: CreateStaffUseCase });
  c.register('IUpdateStaffUseCase', { useClass: UpdateStaffUseCase });
  c.register('IDeleteStaffUseCase', { useClass: DeleteStaffUseCase });
  c.register('IGetStaffUseCase', { useClass: GetStaffUseCase });
  c.register('IGetAllStaffUseCase', { useClass: GetAllStaffUseCase });

  c.register('IGenerateImageUploadUrlUseCase', { useClass: GenerateImageUploadUrlUseCase });
  c.register('IGenerateImageDownloadUrlUseCase', { useClass: GenerateImageDownloadUrlUseCase });

  c.register('ICreateTreatmentUseCase', { useClass: CreateTreatmentUseCase });
  c.register('IUpdateTreatmentUseCase', { useClass: UpdateTreatmentUseCase });
  c.register('IDeleteTreatmentUseCase', { useClass: DeleteTreatmentUseCase });
  c.register('IGetTreatmentUseCase', { useClass: GetTreatmentUseCase });
  c.register('IGetAllTreatmentsUseCase', { useClass: GetAllTreatmentsUseCase });
  c.register('IGetTreatmentNamesUseCase', { useClass: GetTreatmentNamesUseCase });
  c.register('IAddTreatmentImagesUseCase', { useClass: AddTreatmentImagesUseCase });
  c.register('IGetTreatmentImagesUseCase', { useClass: GetTreatmentImagesUseCase });
  c.register('IDeleteTreatmentImageUseCase', { useClass: DeleteTreatmentImageUseCase });

  c.register('ICreateClinicUseCase', { useClass: CreateClinicUseCase });
  c.register('IUpdateClinicUseCase', { useClass: UpdateClinicUseCase });
  c.register('IDeleteClinicUseCase', { useClass: DeleteClinicUseCase });
  c.register('IGetClinicUseCase', { useClass: GetClinicUseCase });
  c.register('IGetAllClinicsUseCase', { useClass: GetAllClinicsUseCase });
  c.register('IGetClinicNamesUseCase', { useClass: GetClinicNamesUseCase });
  c.register('IGetClinicImagesUseCase', { useClass: GetClinicImagesUseCase });
  c.register('IDeleteClinicImageUseCase', { useClass: DeleteClinicImageUseCase });
  c.register('IAddClinicImagesUseCase', { useClass: AddClinicImagesUseCase });

  c.register('ICreatePatientUseCase', { useClass: CreatePatientUseCase });
  c.register('IUpdatePatientUseCase', { useClass: UpdatePatientUseCase });
  c.register('IDeletePatientUseCase', { useClass: DeletePatientUseCase });
  c.register('IRestorePatientUseCase', { useClass: RestorePatientUseCase });
  c.register('IGetPatientsUseCase', { useClass: GetPatientsUseCase });
  c.register('IGetPatientUseCase', { useClass: GetPatientUseCase });

  c.register('ICreateTreatmentCourseUseCase', { useClass: CreateTreatmentCourseUseCase });
  c.register('IUpdateTreatmentCourseUseCase', { useClass: UpdateTreatmentCourseUseCase });
  c.register('IDeleteTreatmentCourseUseCase', { useClass: DeleteTreatmentCourseUseCase });
  c.register('IGetTreatmentCourseUseCase', { useClass: GetTreatmentCourseUseCase });
  c.register('IGetAllTreatmentCoursesUseCase', { useClass: GetAllTreatmentCoursesUseCase });

  c.register('ICreateVisitUseCase', { useClass: CreateVisitUseCase });
  c.register('IUpdateVisitUseCase', { useClass: UpdateVisitUseCase });
  c.register('IDeleteVisitUseCase', { useClass: DeleteVisitUseCase });
  c.register('IGetVisitUseCase', { useClass: GetVisitUseCase });
  c.register('IGetAllVisitsUseCase', { useClass: GetAllVisitsUseCase });
  c.register('IGetVisitRemindersUseCase', { useClass: GetVisitRemindersUseCase });
  c.register('IGetDailyActivitiesUseCase', { useClass: GetDailyActivitiesUseCase });

  c.register('ICreatePaymentUseCase', { useClass: CreatePaymentUseCase });
  c.register('IGetPaymentUseCase', { useClass: GetPaymentUseCase });
  c.register('IGetAllPaymentsUseCase', { useClass: GetAllPaymentsUseCase });
  c.register('IRefundPaymentUseCase', { useClass: RefundPaymentUseCase });

  c.register('ICreatePrescriptionUseCase', { useClass: CreatePrescriptionUseCase });
  c.register('IGetPrescriptionUseCase', { useClass: GetPrescriptionUseCase });
  c.register('IGetAllPrescriptionsUseCase', { useClass: GetAllPrescriptionsUseCase });
  c.register('IUpdatePrescriptionUseCase', { useClass: UpdatePrescriptionUseCase });
  c.register('IDeletePrescriptionUseCase', { useClass: DeletePrescriptionUseCase });

  c.register('ICreateCalendarEntryUseCase', { useClass: CreateCalendarEntryUseCase });
  c.register('IUpdateCalendarEntryUseCase', { useClass: UpdateCalendarEntryUseCase });
  c.register('IDeleteCalendarEntryUseCase', { useClass: DeleteCalendarEntryUseCase });
  c.register('IGetCalendarEntryUseCase', { useClass: GetCalendarEntryUseCase });
  c.register('IGetMonthlyCalendarUseCase', { useClass: GetMonthlyCalendarUseCase });
  c.register('IGetCalendarEntriesByDateUseCase', { useClass: GetCalendarEntriesByDateUseCase });
  c.register('IAddAppointmentUseCase', { useClass: AddAppointmentUseCase });
  c.register('IUpdateAppointmentUseCase', { useClass: UpdateAppointmentUseCase });
  c.register('IDeleteAppointmentUseCase', { useClass: DeleteAppointmentUseCase });
  c.register('IToggleAppointmentCompletedUseCase', { useClass: ToggleAppointmentCompletedUseCase });
  c.register('IGetAppointmentsUseCase', { useClass: GetAppointmentsUseCase });

  c.register('IGetFinancialDashboardUseCase', { useClass: GetFinancialDashboardUseCase });

  c.register('ICreateMediaUseCase', { useClass: CreateMediaUseCase });
  c.register('IGetMediaUseCase', { useClass: GetMediaUseCase });
  c.register('IGetAllMediaUseCase', { useClass: GetAllMediaUseCase });
  c.register('IUpdateMediaUseCase', { useClass: UpdateMediaUseCase });
  c.register('IDeleteMediaUseCase', { useClass: DeleteMediaUseCase });

  c.register(ImageServiceController, { useClass: ImageServiceController });
  c.register(TreatmentController, { useClass: TreatmentController });
  c.register(ClinicController, { useClass: ClinicController });
  c.register(PatientController, { useClass: PatientController });
  c.register(TreatmentCourseController, { useClass: TreatmentCourseController });
  c.register(VisitController, { useClass: VisitController });
  c.register(DailyActivityController, { useClass: DailyActivityController });
  c.register(PaymentController, { useClass: PaymentController });
  c.register(PrescriptionController, { useClass: PrescriptionController });
  c.register(MediaController, { useClass: MediaController });
  c.register(CalendarEntryController, { useClass: CalendarEntryController });
  c.register(AnalyticsController, { useClass: AnalyticsController });
  c.register(StaffController, { useClass: StaffController });
  c.register(AuthController, { useClass: AuthController });
  c.register(AuthMiddleware, { useClass: AuthMiddleware });
}

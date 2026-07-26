import 'reflect-metadata';
import { container, injectable, DependencyContainer } from 'tsyringe';
import type { Env } from '../infrastructure/cloudflare/env';
import { IJwtService } from '../application/interfaces/jwt-service.interface';
import { IPasswordService } from '../application/interfaces/password-service.interface';
import { JoseJwtService } from '../infrastructure/cloudflare/services/jose-jwt.service';
import { WebCryptoPasswordService } from '../infrastructure/cloudflare/services/webcrypto-password.service';
import { IDoctorRepository } from '../domain/repositories/doctor.repository';
import { D1DoctorRepository } from '../infrastructure/cloudflare/repositories/d1/doctor.repository';
import { IStaffRepository } from '../domain/repositories/staff.repository';
import { D1StaffRepository } from '../infrastructure/cloudflare/repositories/d1/staff.repository';
import { IMediaRepository } from '../domain/repositories/media.repository';
import { D1MediaRepository } from '../infrastructure/cloudflare/repositories/d1/media.repository';
import { IPrescriptionRepository } from '../domain/repositories/prescription.repository';
import { D1PrescriptionRepository } from '../infrastructure/cloudflare/repositories/d1/prescription.repository';
import { IPatientIdCounterRepository } from '../domain/repositories/patient-id-counter.repository';
import { D1PatientIdCounterRepository } from '../infrastructure/cloudflare/repositories/d1/patient-id-counter.repository';
import { IPatientRepository } from '../domain/repositories/patient.repository';
import { D1PatientRepository } from '../infrastructure/cloudflare/repositories/d1/patient.repository';
import { ITreatmentCourseRepository } from '../domain/repositories/treatment-course.repository';
import { D1TreatmentCourseRepository } from '../infrastructure/cloudflare/repositories/d1/treatment-course.repository';
import { IVisitRepository } from '../domain/repositories/visit.repository';
import { D1VisitRepository } from '../infrastructure/cloudflare/repositories/d1/visit.repository';
import { IPaymentRepository } from '../domain/repositories/payment.repository';
import { D1PaymentRepository } from '../infrastructure/cloudflare/repositories/d1/payment.repository';
import { IClinicRepository } from '../domain/repositories/clinic.repository';
import { D1ClinicRepository } from '../infrastructure/cloudflare/repositories/d1/clinic.repository';
import { ITreatmentRepository } from '../domain/repositories/treatment.repository';
import { D1TreatmentRepository } from '../infrastructure/cloudflare/repositories/d1/treatment.repository';
import { ICalendarEntryRepository } from '../domain/repositories/calendar-entry.repository';
import { D1CalendarEntryRepository } from '../infrastructure/cloudflare/repositories/d1/calendar-entry.repository';
import { IFileStorageService } from '../application/interfaces/file-storage-service.interface';
import { R2StorageAdapter } from '../infrastructure/cloudflare/services/r2-storage.adapter';
import { IImageUploadService } from '../application/interfaces/image-upload-service.interface';
import { ImageUploadService } from '../infrastructure/shared/image-upload.service';
import { ITransactionManager } from '../application/interfaces/transaction-manager.interface';
import { D1TransactionManager } from '../infrastructure/cloudflare/services/d1-transaction-manager';
import { IPatientCascade } from '../application/interfaces/patient-cascade.interface';
import { D1PatientCascadeService } from '../infrastructure/cloudflare/services/d1-patient-cascade.service';
import { registerAppLayer } from './register-app-layer';

@injectable()
export class HealthCheckService {
  check(): { status: string; runtime: string } {
    return { status: 'ok', runtime: 'cloudflare-workers' };
  }
}

/**
 * Per-request composition root. Cloudflare bindings (D1, R2) only exist on the
 * request `env`, so a child container is created per request with `env` and its
 * bindings registered. Repositories/services registered here can `@inject` them.
 */
export function buildRequestContainer(env: Env): DependencyContainer {
  const scope = container.createChildContainer();
  scope.register<Env>('Env', { useValue: env });
  scope.register<D1Database>('DB', { useValue: env.DB });
  scope.register<R2Bucket>('MEDIA', { useValue: env.MEDIA });

  scope.register<IJwtService>('IJwtService', { useClass: JoseJwtService });
  scope.register<IPasswordService>('IPasswordService', { useClass: WebCryptoPasswordService });

  scope.register<IDoctorRepository>('IDoctorRepository', { useClass: D1DoctorRepository });
  scope.register<IStaffRepository>('IStaffRepository', { useClass: D1StaffRepository });
  scope.register<IMediaRepository>('IMediaRepository', { useClass: D1MediaRepository });
  scope.register<IPrescriptionRepository>('IPrescriptionRepository', { useClass: D1PrescriptionRepository });
  scope.register<IPatientIdCounterRepository>('IPatientIdCounterRepository', { useClass: D1PatientIdCounterRepository });
  scope.register<IPatientRepository>('IPatientRepository', { useClass: D1PatientRepository });
  scope.register<ITreatmentCourseRepository>('ITreatmentCourseRepository', { useClass: D1TreatmentCourseRepository });
  scope.register<IVisitRepository>('IVisitRepository', { useClass: D1VisitRepository });
  scope.register<IPaymentRepository>('IPaymentRepository', { useClass: D1PaymentRepository });
  scope.register<IClinicRepository>('IClinicRepository', { useClass: D1ClinicRepository });
  scope.register<ITreatmentRepository>('ITreatmentRepository', { useClass: D1TreatmentRepository });
  scope.register<ICalendarEntryRepository>('ICalendarEntryRepository', { useClass: D1CalendarEntryRepository });

  scope.register<IFileStorageService>('IFileStorageService', { useClass: R2StorageAdapter });
  scope.register<IImageUploadService>('IImageUploadService', { useClass: ImageUploadService });
  scope.register<ITransactionManager>('ITransactionManager', { useClass: D1TransactionManager });
  scope.register<IPatientCascade>('IPatientCascade', { useClass: D1PatientCascadeService });

  registerAppLayer(scope);

  return scope;
}

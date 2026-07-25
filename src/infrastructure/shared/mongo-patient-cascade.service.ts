import { injectable, inject } from 'tsyringe';
import { IPatientCascade } from '../../application/interfaces/patient-cascade.interface';
import { ITransactionManager } from '../../application/interfaces/transaction-manager.interface';
import { IPatientRepository } from '../../domain/repositories/patient.repository';
import { IVisitRepository } from '../../domain/repositories/visit.repository';
import { ITreatmentCourseRepository } from '../../domain/repositories/treatment-course.repository';
import { IPaymentRepository } from '../../domain/repositories/payment.repository';
import { IMediaRepository } from '../../domain/repositories/media.repository';

@injectable()
export class MongoPatientCascadeService implements IPatientCascade {
  constructor(
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository,
    @inject('IVisitRepository') private readonly visitRepository: IVisitRepository,
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository,
    @inject('IPaymentRepository') private readonly paymentRepository: IPaymentRepository,
    @inject('IMediaRepository') private readonly mediaRepository: IMediaRepository,
    @inject('ITransactionManager') private readonly txManager: ITransactionManager
  ) {}

  async softDelete(patientId: string, doctorId: string): Promise<void> {
    await this.txManager.runInTransaction(async (tx) => {
      await this.patientRepository.update(patientId, { isDeleted: true, isActive: false }, tx);
      await this.visitRepository.markDeletedByPatientId(patientId, doctorId, tx);
      await this.treatmentCourseRepository.markDeletedByPatientId(patientId, doctorId, tx);
      await this.paymentRepository.markDeletedByPatientId(patientId, doctorId, tx);
      await this.mediaRepository.markDeletedByPatientId(patientId, doctorId, tx);
    });
  }

  async restore(patientId: string, doctorId: string): Promise<void> {
    await this.txManager.runInTransaction(async (tx) => {
      await this.patientRepository.update(patientId, { isDeleted: false, isActive: true }, tx);
      await this.visitRepository.markRestoredByPatientId(patientId, doctorId, tx);
      await this.treatmentCourseRepository.markRestoredByPatientId(patientId, doctorId, tx);
      await this.paymentRepository.markRestoredByPatientId(patientId, doctorId, tx);
      await this.mediaRepository.markRestoredByPatientId(patientId, doctorId, tx);
    });
  }
}

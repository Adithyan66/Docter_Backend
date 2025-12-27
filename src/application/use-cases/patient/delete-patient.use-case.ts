import { injectable, inject } from 'tsyringe';
import mongoose from 'mongoose';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { IVisitRepository } from '../../../domain/repositories/visit.repository';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository';
import { IMediaRepository } from '../../../domain/repositories/media.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { ValidationError } from '../../../domain/errors/validation.error';
import { IDeletePatientUseCase } from '../../interfaces/use-cases/patient/patient-use-cases.interface';

@injectable()
export class DeletePatientUseCase implements IDeletePatientUseCase {
  constructor(
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository,
    @inject('IVisitRepository') private readonly visitRepository: IVisitRepository,
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository,
    @inject('IPaymentRepository') private readonly paymentRepository: IPaymentRepository,
    @inject('IMediaRepository') private readonly mediaRepository: IMediaRepository
  ) {}

  async execute(id: string, doctorId: string): Promise<void> {
    const patient = await this.patientRepository.findByIdAndDoctor(id, doctorId);
    if (!patient) {
      throw new NotFoundError('Patient', id);
    }

    if (patient.isDeleted) {
      throw new ValidationError('Patient is already deleted');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      patient.markDeleted();
      await this.patientRepository.update(id, { isDeleted: patient.isDeleted, isActive: patient.isActive }, session);

      await this.visitRepository.markDeletedByPatientId(id, doctorId, session);
      await this.treatmentCourseRepository.markDeletedByPatientId(id, doctorId, session);
      await this.paymentRepository.markDeletedByPatientId(id, doctorId, session);
      await this.mediaRepository.markDeletedByPatientId(id, doctorId, session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}



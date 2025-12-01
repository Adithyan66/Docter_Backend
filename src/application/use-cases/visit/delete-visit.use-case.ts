import { injectable, inject } from 'tsyringe';
import mongoose from 'mongoose';
import { IVisitRepository } from '../../../domain/repositories/visit.repository';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { MongoVisitRepository } from '../../../infrastructure/repositories/mongodb/visit.repository';
import { MongoPatientRepository } from '../../../infrastructure/repositories/mongodb/patient.repository';
import { MongoTreatmentCourseRepository } from '../../../infrastructure/repositories/mongodb/treatment-course.repository';

@injectable()
export class DeleteVisitUseCase {
  constructor(
    @inject('IVisitRepository') private readonly visitRepository: IVisitRepository,
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository,
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository
  ) {}

  async execute(id: string, doctorId: string): Promise<void> {
    const visit = await this.visitRepository.findByIdAndDoctor(id, doctorId);
    if (!visit) {
      throw new NotFoundError('Visit', id);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const mongoVisitRepo = this.visitRepository as MongoVisitRepository;
      const mongoPatientRepo = this.patientRepository as MongoPatientRepository;
      const mongoCourseRepo = this.treatmentCourseRepository as MongoTreatmentCourseRepository;

      const deleted = await mongoVisitRepo.delete(id, session);
      if (!deleted) {
        throw new NotFoundError('Visit', id);
      }

      const patient = await this.patientRepository.findById(visit.patientId);
      if (patient) {
        patient.decrementVisitCount();
        await mongoPatientRepo.update(patient.id, patient, session);
      }

      const course = await this.treatmentCourseRepository.findById(visit.courseId);
      if (course) {
        course.removeVisit(visit.id);
        await mongoCourseRepo.update(course.id, course, session);

        if (visit.billedAmount && visit.billedAmount > 0) {
          await mongoCourseRepo.decrementTotalPaid(course.id, visit.billedAmount, session);
        }
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}


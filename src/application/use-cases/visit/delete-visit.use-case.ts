import { injectable, inject } from 'tsyringe';
import { ITransactionManager } from '../../interfaces/transaction-manager.interface';
import { IVisitRepository } from '../../../domain/repositories/visit.repository';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { IDeleteVisitUseCase } from '../../interfaces/use-cases/visit/visit-use-cases.interface';

@injectable()
export class DeleteVisitUseCase implements IDeleteVisitUseCase {
  constructor(
    @inject('IVisitRepository') private readonly visitRepository: IVisitRepository,
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository,
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository,
    @inject('ITransactionManager') private readonly txManager: ITransactionManager
  ) {}

  async execute(id: string, doctorId: string): Promise<void> {
    const visit = await this.visitRepository.findByIdAndDoctor(id, doctorId);
    if (!visit) {
      throw new NotFoundError('Visit', id);
    }

    await this.txManager.runInTransaction(async (tx) => {
      const deleted = await this.visitRepository.delete(id);
      if (!deleted) {
        throw new NotFoundError('Visit', id);
      }

      const patient = await this.patientRepository.findById(visit.patientId);
      if (patient) {
        patient.decrementVisitCount();
        await this.patientRepository.update(patient.id, patient, tx);
      }

      const course = await this.treatmentCourseRepository.findById(visit.courseId);
      if (course) {
        course.removeVisit(visit.id);
        await this.treatmentCourseRepository.update(course.id, course, tx);

        if (visit.billedAmount && visit.billedAmount > 0) {
          await this.treatmentCourseRepository.decrementTotalPaid(course.id, visit.billedAmount, tx);
        }
      }
    });
  }
}


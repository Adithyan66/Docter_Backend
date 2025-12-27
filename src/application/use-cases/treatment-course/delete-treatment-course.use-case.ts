import { injectable, inject } from 'tsyringe';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { IDeleteTreatmentCourseUseCase } from '../../interfaces/use-cases/treatment-course/treatment-course-use-cases.interface';

@injectable()
export class DeleteTreatmentCourseUseCase implements IDeleteTreatmentCourseUseCase {
  constructor(
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository
  ) {}

  async execute(id: string, doctorId: string): Promise<void> {
    const treatmentCourse = await this.treatmentCourseRepository.findByIdAndDoctor(id, doctorId);
    if (!treatmentCourse) {
      throw new NotFoundError('TreatmentCourse', id);
    }

    const deleted = await this.treatmentCourseRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('TreatmentCourse', id);
    }
  }
}


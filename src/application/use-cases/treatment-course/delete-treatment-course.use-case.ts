import { injectable, inject } from 'tsyringe';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';

@injectable()
export class DeleteTreatmentCourseUseCase {
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


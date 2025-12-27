import { injectable, inject } from 'tsyringe';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { TreatmentCourseResponseDto } from '../../../presentation/dto/treatment-course.dto';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { treatmentCourseToDto } from '../../mappers/treatment-course.mapper';
import { IGetTreatmentCourseUseCase } from '../../interfaces/use-cases/treatment-course/treatment-course-use-cases.interface';

@injectable()
export class GetTreatmentCourseUseCase implements IGetTreatmentCourseUseCase {
  constructor(
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository
  ) {}

  async execute(id: string, doctorId: string): Promise<TreatmentCourseResponseDto> {
    const treatmentCourse = await this.treatmentCourseRepository.findByIdAndDoctor(id, doctorId);
    if (!treatmentCourse) {
      throw new NotFoundError('TreatmentCourse', id);
    }
    return treatmentCourseToDto(treatmentCourse);
  }
}


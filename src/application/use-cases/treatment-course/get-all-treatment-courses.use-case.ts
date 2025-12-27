import { injectable, inject } from 'tsyringe';
import { ITreatmentCourseRepository, TreatmentCourseSearchOptions } from '../../../domain/repositories/treatment-course.repository';
import { GetTreatmentCoursesQueryDto, PaginatedTreatmentCoursesResponseDto } from '../../../presentation/dto/treatment-course.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { treatmentCourseToDto } from '../../mappers/treatment-course.mapper';
import { IGetAllTreatmentCoursesUseCase } from '../../interfaces/use-cases/treatment-course/treatment-course-use-cases.interface';

@injectable()
export class GetAllTreatmentCoursesUseCase implements IGetAllTreatmentCoursesUseCase {
  constructor(
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository
  ) {}

  async execute(doctorId: string, input: GetTreatmentCoursesQueryDto): Promise<PaginatedTreatmentCoursesResponseDto> {
    const page = input.page && input.page > 0 ? input.page : 1;
    const limit = input.limit && input.limit > 0 ? Math.min(input.limit, 100) : 10;

    const startDateFrom = input.startDateFrom ? this.parseDate(input.startDateFrom, 'startDateFrom') : undefined;
    const startDateTo = input.startDateTo ? this.parseDate(input.startDateTo, 'startDateTo') : undefined;

    if (startDateFrom && startDateTo && startDateFrom > startDateTo) {
      throw new ValidationError('startDateFrom must be before or equal to startDateTo');
    }

    const options: TreatmentCourseSearchOptions = {
      doctorId,
      page,
      limit,
      clinicId: input.clinicId?.trim(),
      treatmentId: input.treatmentId?.trim(),
      patientId: input.patientId?.trim(),
      status: input.status,
      startDateFrom,
      startDateTo,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    };

    const result = await this.treatmentCourseRepository.findPaginated(options);

    return {
      treatmentCourses: result.treatmentCourses.map((tc) => treatmentCourseToDto(tc)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  private parseDate(value: string, field: string): Date {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError(`Invalid ${field} value`);
    }
    return date;
  }
}


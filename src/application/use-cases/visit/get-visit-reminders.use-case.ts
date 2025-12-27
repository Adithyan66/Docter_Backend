import { injectable, inject } from 'tsyringe';
import { ITreatmentCourseRepository, VisitReminderSearchOptions } from '../../../domain/repositories/treatment-course.repository';
import { GetVisitRemindersQueryDto, PaginatedVisitRemindersResponseDto } from '../../../presentation/dto/visit-reminder.dto';
import { IGetVisitRemindersUseCase } from '../../interfaces/use-cases/visit/visit-use-cases.interface';

@injectable()
export class GetVisitRemindersUseCase implements IGetVisitRemindersUseCase {
  constructor(
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository
  ) {}

  async execute(doctorId: string, input: GetVisitRemindersQueryDto): Promise<PaginatedVisitRemindersResponseDto> {
    const page = input.page && input.page > 0 ? input.page : 1;
    const limit = input.limit && input.limit > 0 ? Math.min(input.limit, 100) : 10;

    const daysBefore = input.daysBefore !== undefined ? input.daysBefore : 5;
    const daysAfter = input.daysAfter !== undefined ? input.daysAfter : 5;

    const treatmentIds = input.treatmentId
      ? input.treatmentId.split(',').map(id => id.trim()).filter(id => id.length > 0)
      : undefined;

    const clinicIds = input.clinicId
      ? input.clinicId.split(',').map(id => id.trim()).filter(id => id.length > 0)
      : undefined;

    const options: VisitReminderSearchOptions = {
      doctorId,
      page,
      limit,
      daysBefore,
      daysAfter,
      treatmentIds,
      clinicIds,
    };

    const result = await this.treatmentCourseRepository.findVisitReminders(options);

    return {
      reminders: result.reminders,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}


import { injectable, inject } from 'tsyringe';
import { IVisitRepository } from '../../../domain/repositories/visit.repository';
import { GetDailyActivitiesQueryDto, PaginatedDailyActivitiesResponseDto } from '../../../presentation/dto/daily-activity.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { mapToDailyActivityResponse } from '../../mappers/daily-activity.mapper';
import { IGetDailyActivitiesUseCase } from '../../interfaces/use-cases/daily-activity/daily-activity-use-cases.interface';

@injectable()
export class GetDailyActivitiesUseCase implements IGetDailyActivitiesUseCase {
  constructor(
    @inject('IVisitRepository') private readonly visitRepository: IVisitRepository
  ) {}

  async execute(doctorId: string, query: GetDailyActivitiesQueryDto): Promise<PaginatedDailyActivitiesResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 10;

    if (!query.date) {
      throw new ValidationError('Date parameter is required');
    }

    const date = new Date(query.date);
    if (isNaN(date.getTime())) {
      throw new ValidationError('Invalid date format. Expected YYYY-MM-DD format');
    }

    if (page < 1) {
      throw new ValidationError('Page must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    const result = await this.visitRepository.getDailyActivitiesAggregated({
      doctorId,
      date,
      page,
      limit,
      clinicId: query.clinicId,
    });

    return mapToDailyActivityResponse(result);
  }
}


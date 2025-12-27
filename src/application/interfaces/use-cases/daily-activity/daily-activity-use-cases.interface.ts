import { GetDailyActivitiesQueryDto, PaginatedDailyActivitiesResponseDto } from '../../../../presentation/dto/daily-activity.dto';

export { GetDailyActivitiesQueryDto, PaginatedDailyActivitiesResponseDto };

export interface IGetDailyActivitiesUseCase {
  execute(doctorId: string, query: GetDailyActivitiesQueryDto): Promise<PaginatedDailyActivitiesResponseDto>;
}

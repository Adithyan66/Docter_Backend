import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { GetDailyActivitiesUseCase } from '../../application/use-cases/daily-activity/get-daily-activities.use-case';
import { ValidationError } from '../../domain/errors/validation.error';
import { GetDailyActivitiesQueryDto } from '../dto/daily-activity.dto';
import { getUserId, getUserContext } from '../utils/user-context.util';

@injectable()
export class DailyActivityController {
  constructor(
    @inject('GetDailyActivitiesUseCase') private readonly getDailyActivitiesUseCase: GetDailyActivitiesUseCase
  ) {}

  async getAll(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const context = getUserContext(req);
    const query = this.buildQueryDto(req);
    
    if (context.role === 'staff' && context.clinicId) {
      query.clinicId = context.clinicId;
    }
    
    const result = await this.getDailyActivitiesUseCase.execute(context.doctorId, query);
    successResponse(res, result, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  private buildQueryDto(req: HttpRequest): GetDailyActivitiesQueryDto {
    return {
      date: req.query.date ? String(req.query.date) : '',
      page: req.query.page ? parseInt(String(req.query.page), 10) : undefined,
      limit: req.query.limit ? parseInt(String(req.query.limit), 10) : undefined,
      clinicId: req.query.clinicId ? String(req.query.clinicId) : undefined,
    };
  }
}


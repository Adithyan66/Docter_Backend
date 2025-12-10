import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { GetDailyActivitiesUseCase } from '../../application/use-cases/daily-activity/get-daily-activities.use-case';
import { ValidationError } from '../../domain/errors/validation.error';
import { UnauthorizedError } from '../../domain/errors/unauthorized.error';
import { GetDailyActivitiesQueryDto } from '../dto/daily-activity.dto';
import { AuthenticationErrors } from '../../infrastructure/constants';

@injectable()
export class DailyActivityController {
  constructor(
    @inject('GetDailyActivitiesUseCase') private readonly getDailyActivitiesUseCase: GetDailyActivitiesUseCase
  ) {}

  async getAll(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const query = this.buildQueryDto(req);
    const doctorId = this.getDoctorId(req);
    const result = await this.getDailyActivitiesUseCase.execute(doctorId, query);
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

  private getDoctorId(req: HttpRequest): string {
    const user = req.user as { id?: string; role?: string; doctorId?: string } | undefined;
    if (!user || !user.id || !user.role) {
      throw new UnauthorizedError(AuthenticationErrors.UNAUTHORIZED);
    }
    if (user.role === 'staff') {
      if (!user.doctorId) {
        throw new UnauthorizedError(AuthenticationErrors.UNAUTHORIZED);
      }
      return user.doctorId;
    }
    return user.id;
  }
}


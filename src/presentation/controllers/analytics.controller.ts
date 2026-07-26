import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { IAnalyticsController } from '../interfaces/controllers/analytics-controller.interface';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { IGetFinancialDashboardUseCase } from '../../application/interfaces/use-cases/analytics/analytics-use-cases.interface';
import { FinancialDashboardQueryDto } from '../dto/analytics.dto';
import { getUserContext } from '../utils/user-context.util';

@injectable()
export class AnalyticsController implements IAnalyticsController {
  constructor(
    @inject('IGetFinancialDashboardUseCase')
    private readonly getFinancialDashboardUseCase: IGetFinancialDashboardUseCase
  ) {}

  async getDashboard(req: HttpRequest, res: HttpResponse, _next?: HttpNext): Promise<void> {
    const context = getUserContext(req);

    const query: FinancialDashboardQueryDto = {
      period: req.query.period as 'daily' | 'weekly' | 'monthly' | undefined,
      dateFrom: req.query.dateFrom ? String(req.query.dateFrom) : undefined,
      dateTo: req.query.dateTo ? String(req.query.dateTo) : undefined,
      clinicId: req.query.clinicId ? String(req.query.clinicId) : undefined,
      months: req.query.months ? parseInt(String(req.query.months), 10) : undefined,
    };

    // Staff see only their own clinic; their token's clinic overrides any query param.
    if (context.role === 'staff' && context.clinicId) {
      query.clinicId = context.clinicId;
    }

    const dashboard = await this.getFinancialDashboardUseCase.execute(context.doctorId, query);
    successResponse(res, dashboard, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }
}

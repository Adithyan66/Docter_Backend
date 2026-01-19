import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { IFinancialAnalyticsController } from '../interfaces/controllers/financial-analytics-controller.interface';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { IGetFinancialDashboardUseCase } from '../../application/interfaces/use-cases/financial-analytics/financial-analytics-use-cases.interface';
import { FinancialDashboardQueryDto } from '../dto/financial-analytics.dto';
import { getUserContext } from '../utils/user-context.util';

@injectable()
export class FinancialAnalyticsController implements IFinancialAnalyticsController {
  constructor(
    @inject('IGetFinancialDashboardUseCase') private readonly getFinancialDashboardUseCase: IGetFinancialDashboardUseCase
  ) {}

  async getDashboard(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const context = getUserContext(req);
    const query: FinancialDashboardQueryDto = {
      period: req.query.period as 'daily' | 'weekly' | 'monthly' | undefined,
      dateFrom: req.query.dateFrom ? String(req.query.dateFrom) : undefined,
      dateTo: req.query.dateTo ? String(req.query.dateTo) : undefined,
      clinicId: req.query.clinicId ? String(req.query.clinicId) : undefined,
      months: req.query.months ? parseInt(String(req.query.months), 10) : undefined,
    };

    if (context.role === 'staff' && context.clinicId) {
      query.clinicId = context.clinicId;
    }

    const dashboard = await this.getFinancialDashboardUseCase.execute(context.doctorId, query);

    successResponse(res, dashboard, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }
}


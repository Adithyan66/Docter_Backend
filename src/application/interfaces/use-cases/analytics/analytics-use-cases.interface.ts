import {
  FinancialDashboardQueryDto,
  FinancialDashboardResponseDto,
} from '../../../../presentation/dto/analytics.dto';

export interface IGetFinancialDashboardUseCase {
  execute(doctorId: string, query: FinancialDashboardQueryDto): Promise<FinancialDashboardResponseDto>;
}



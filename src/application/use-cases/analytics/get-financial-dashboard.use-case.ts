import { injectable, inject } from 'tsyringe';
import { IGetFinancialDashboardUseCase } from '../../interfaces/use-cases/analytics/analytics-use-cases.interface';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { IVisitRepository } from '../../../domain/repositories/visit.repository';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import {
  FinancialDashboardQueryDto,
  FinancialDashboardResponseDto,
} from '../../../presentation/dto/analytics.dto';

const round2 = (value: number): number => Math.round(value * 100) / 100;

@injectable()
export class GetFinancialDashboardUseCase implements IGetFinancialDashboardUseCase {
  constructor(
    @inject('IPaymentRepository') private readonly paymentRepository: IPaymentRepository,
    @inject('ITreatmentCourseRepository')
    private readonly treatmentCourseRepository: ITreatmentCourseRepository,
    @inject('IVisitRepository') private readonly visitRepository: IVisitRepository,
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository
  ) {}

  async execute(
    doctorId: string,
    query: FinancialDashboardQueryDto
  ): Promise<FinancialDashboardResponseDto> {
    const period = query.period || 'monthly';
    const months = query.months || 12;
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;
    const clinicId = query.clinicId;

    const { trendFrom, trendTo } = this.resolveTrendWindow(period, dateFrom, dateTo);

    const [
      revenueMetrics,
      revenueTrend,
      revenueByPaymentMethod,
      revenueByClinic,
      monthlyRevenueComparison,
      outstandingAmount,
      paymentCompletionRate,
      totalVisitCount,
      activePatientCount,
    ] = await Promise.all([
      this.paymentRepository.getRevenueMetrics(doctorId, dateFrom, dateTo, clinicId),
      this.paymentRepository.getRevenueTrend(doctorId, period, trendFrom, trendTo, clinicId),
      this.paymentRepository.getRevenueByPaymentMethod(doctorId, dateFrom, dateTo, clinicId),
      this.paymentRepository.getRevenueByClinic(doctorId, dateFrom, dateTo),
      this.paymentRepository.getMonthlyRevenueComparison(doctorId, months, clinicId),
      this.treatmentCourseRepository.getOutstandingAmount(doctorId, clinicId),
      this.paymentRepository.getPaymentCompletionStats(doctorId, clinicId),
      this.visitRepository.getTotalVisitCount(doctorId, clinicId),
      this.patientRepository.getActivePatientCount(doctorId, clinicId),
    ]);

    const averageRevenuePerVisit =
      totalVisitCount > 0 ? revenueMetrics.totalRevenue / totalVisitCount : 0;
    const averageRevenuePerPatient =
      activePatientCount > 0 ? revenueMetrics.totalRevenue / activePatientCount : 0;

    return {
      metrics: {
        totalRevenue: revenueMetrics.totalRevenue,
        revenueThisMonth: revenueMetrics.revenueThisMonth,
        revenueThisYear: revenueMetrics.revenueThisYear,
        averageRevenuePerVisit: round2(averageRevenuePerVisit),
        averageRevenuePerPatient: round2(averageRevenuePerPatient),
      },
      revenueTrend,
      revenueByPaymentMethod,
      revenueByClinic,
      monthlyRevenueComparison,
      outstandingAmount,
      paymentCompletionRate,
    };
  }

  /**
   * The trend chart always needs a bounded window, so an unset side falls back to
   * a lookback sized to the bucket granularity: 30 days, 12 weeks, or 12 months.
   */
  private resolveTrendWindow(
    period: 'daily' | 'weekly' | 'monthly',
    dateFrom?: Date,
    dateTo?: Date
  ): { trendFrom: Date; trendTo: Date } {
    const now = new Date();
    const trendTo = dateTo ?? now;

    if (dateFrom) return { trendFrom: dateFrom, trendTo };

    const trendFrom = new Date(now);
    if (period === 'daily') {
      trendFrom.setUTCDate(now.getUTCDate() - 30);
    } else if (period === 'weekly') {
      trendFrom.setUTCDate(now.getUTCDate() - 84);
    } else {
      trendFrom.setUTCMonth(now.getUTCMonth() - 12);
    }
    return { trendFrom, trendTo };
  }
}

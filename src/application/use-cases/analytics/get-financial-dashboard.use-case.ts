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

@injectable()
export class GetFinancialDashboardUseCase implements IGetFinancialDashboardUseCase {
  constructor(
    @inject('IPaymentRepository') private readonly paymentRepository: IPaymentRepository,
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository,
    @inject('IVisitRepository') private readonly visitRepository: IVisitRepository,
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository
  ) {}

  async execute(doctorId: string, query: FinancialDashboardQueryDto): Promise<FinancialDashboardResponseDto> {
    const period = query.period || 'monthly';
    const months = query.months || 12;
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;
    const clinicId = query.clinicId;

    let trendDateFrom = dateFrom;
    let trendDateTo = dateTo;

    if (!trendDateFrom || !trendDateTo) {
      const now = new Date();
      if (!trendDateTo) {
        trendDateTo = now;
      }
      if (!trendDateFrom) {
        trendDateFrom = new Date(now);
        if (period === 'daily') {
          trendDateFrom.setDate(now.getDate() - 30);
        } else if (period === 'weekly') {
          trendDateFrom.setDate(now.getDate() - 84);
        } else {
          trendDateFrom.setMonth(now.getMonth() - 12);
        }
      }
    }

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
      this.paymentRepository.getRevenueTrend(doctorId, period, trendDateFrom, trendDateTo, clinicId),
      this.paymentRepository.getRevenueByPaymentMethod(doctorId, dateFrom, dateTo, clinicId),
      this.paymentRepository.getRevenueByClinic(doctorId, dateFrom, dateTo),
      this.paymentRepository.getMonthlyRevenueComparison(doctorId, months, clinicId),
      this.treatmentCourseRepository.getOutstandingAmount(doctorId, clinicId),
      this.paymentRepository.getPaymentCompletionStats(doctorId, clinicId),
      this.visitRepository.getTotalVisitCount(doctorId, clinicId),
      this.patientRepository.getActivePatientCount(doctorId, clinicId),
    ]);

    const averageRevenuePerVisit = totalVisitCount > 0 ? revenueMetrics.totalRevenue / totalVisitCount : 0;
    const averageRevenuePerPatient = activePatientCount > 0 ? revenueMetrics.totalRevenue / activePatientCount : 0;

    return {
      metrics: {
        totalRevenue: revenueMetrics.totalRevenue,
        revenueThisMonth: revenueMetrics.revenueThisMonth,
        revenueThisYear: revenueMetrics.revenueThisYear,
        averageRevenuePerVisit: Math.round(averageRevenuePerVisit * 100) / 100,
        averageRevenuePerPatient: Math.round(averageRevenuePerPatient * 100) / 100,
      },
      revenueTrend,
      revenueByPaymentMethod,
      revenueByClinic,
      monthlyRevenueComparison,
      outstandingAmount,
      paymentCompletionRate,
    };
  }
}



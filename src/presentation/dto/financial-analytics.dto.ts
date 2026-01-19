import {
  RevenueMetrics,
  RevenueTrendData,
  RevenueByPaymentMethodData,
  RevenueByClinicData,
  MonthlyRevenueData,
  PaymentCompletionStats,
} from '../../domain/repositories/payment.repository';

export interface FinancialDashboardQueryDto {
  period?: 'daily' | 'weekly' | 'monthly';
  dateFrom?: string;
  dateTo?: string;
  clinicId?: string;
  months?: number;
}

export interface FinancialDashboardResponseDto {
  metrics: {
    totalRevenue: number;
    revenueThisMonth: number;
    revenueThisYear: number;
    averageRevenuePerVisit: number;
    averageRevenuePerPatient: number;
  };
  revenueTrend: RevenueTrendData[];
  revenueByPaymentMethod: RevenueByPaymentMethodData[];
  revenueByClinic: RevenueByClinicData[];
  monthlyRevenueComparison: MonthlyRevenueData[];
  outstandingAmount: number;
  paymentCompletionRate: PaymentCompletionStats;
}


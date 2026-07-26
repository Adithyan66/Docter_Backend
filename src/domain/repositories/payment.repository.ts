import { BaseRepository } from './base.repository';
import { Payment } from '../entities/payment.entity';
import { PaymentMethod } from '../value-objects/payment-method.vo';

export interface PaymentSearchOptions {
  doctorId: string;
  page: number;
  limit: number;
  patientId?: string;
  courseId?: string;
  clinicId?: string;
  visitId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  method?: PaymentMethod;
  refunded?: boolean;
  sortBy?: 'createdAt' | 'paidAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface RevenueMetrics {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueThisYear: number;
}

export interface RevenueTrendData {
  date: string;
  amount: number;
}

export interface RevenueByPaymentMethodData {
  method: string;
  amount: number;
  percentage: number;
}

export interface RevenueByClinicData {
  clinicId: string;
  clinicName: string;
  amount: number;
}

export interface MonthlyRevenueData {
  month: string;
  amount: number;
}

export interface PaymentCompletionStats {
  completedCount: number;
  totalCount: number;
  rate: number;
}

export interface IPaymentRepository extends BaseRepository<Payment> {
  findByIdAndDoctor(id: string, doctorId: string): Promise<Payment | null>;
  findPaginated(options: PaymentSearchOptions): Promise<{
    payments: Payment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  markDeletedByPatientId(patientId: string, doctorId: string, session?: any): Promise<number>;
  markRestoredByPatientId(patientId: string, doctorId: string, session?: any): Promise<number>;

  getRevenueMetrics(
    doctorId: string,
    dateFrom?: Date,
    dateTo?: Date,
    clinicId?: string
  ): Promise<RevenueMetrics>;
  getRevenueTrend(
    doctorId: string,
    period: 'daily' | 'weekly' | 'monthly',
    dateFrom: Date,
    dateTo: Date,
    clinicId?: string
  ): Promise<RevenueTrendData[]>;
  getRevenueByPaymentMethod(
    doctorId: string,
    dateFrom?: Date,
    dateTo?: Date,
    clinicId?: string
  ): Promise<RevenueByPaymentMethodData[]>;
  getRevenueByClinic(doctorId: string, dateFrom?: Date, dateTo?: Date): Promise<RevenueByClinicData[]>;
  getMonthlyRevenueComparison(
    doctorId: string,
    months: number,
    clinicId?: string
  ): Promise<MonthlyRevenueData[]>;
  /** Course-level payment completion (totalPaid >= totalCost), not per-payment. */
  getPaymentCompletionStats(doctorId: string, clinicId?: string): Promise<PaymentCompletionStats>;
}


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
}


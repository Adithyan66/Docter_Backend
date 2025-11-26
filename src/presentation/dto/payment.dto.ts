import { PaymentMethod } from '../../domain/value-objects/payment-method.vo';

export interface CreatePaymentRequestDto {
  courseId: string;
  patientId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  visitId?: string;
  clinicId?: string;
  paidAt?: string;
}

export interface RefundPaymentRequestDto {
  refundReason?: string;
  refundAmount?: number;
}

export interface PaymentResponseDto {
  id: string;
  doctorId: string;
  patientId: string;
  courseId: string;
  visitId?: string;
  clinicId?: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  paidAt: Date;
  refunded: boolean;
  refundDetails?: {
    refundedAt: Date;
    refundReason?: string;
    refundAmount: number;
  };
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetPaymentsQueryDto {
  page?: number;
  limit?: number;
  patientId?: string;
  courseId?: string;
  clinicId?: string;
  visitId?: string;
  dateFrom?: string;
  dateTo?: string;
  method?: PaymentMethod;
  refunded?: boolean;
  sortBy?: 'createdAt' | 'paidAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedPaymentsResponseDto {
  payments: PaymentResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


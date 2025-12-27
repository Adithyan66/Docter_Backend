import {
  CreatePaymentRequestDto,
  RefundPaymentRequestDto,
  PaymentResponseDto,
  GetPaymentsQueryDto,
  PaginatedPaymentsResponseDto,
} from '../../../../presentation/dto/payment.dto';

export {
  CreatePaymentRequestDto,
  RefundPaymentRequestDto,
  PaymentResponseDto,
  GetPaymentsQueryDto,
  PaginatedPaymentsResponseDto,
};

export interface ICreatePaymentUseCase {
  execute(doctorId: string, input: CreatePaymentRequestDto): Promise<PaymentResponseDto>;
}

export interface IGetPaymentUseCase {
  execute(id: string, doctorId: string): Promise<PaymentResponseDto>;
}

export interface IGetAllPaymentsUseCase {
  execute(doctorId: string, query: GetPaymentsQueryDto): Promise<PaginatedPaymentsResponseDto>;
}

export interface IRefundPaymentUseCase {
  execute(id: string, doctorId: string, input: RefundPaymentRequestDto): Promise<PaymentResponseDto>;
}

import { injectable, inject } from 'tsyringe';
import { IPaymentRepository, PaymentSearchOptions } from '../../../domain/repositories/payment.repository';
import { PaymentMethod } from '../../../domain/value-objects/payment-method.vo';
import { GetPaymentsQueryDto, PaginatedPaymentsResponseDto } from '../../../presentation/dto/payment.dto';
import { paymentToDto } from '../../mappers/payment.mapper';

@injectable()
export class GetAllPaymentsUseCase {
  constructor(@inject('IPaymentRepository') private readonly paymentRepository: IPaymentRepository) {}

  async execute(doctorId: string, query: GetPaymentsQueryDto): Promise<PaginatedPaymentsResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const options: PaymentSearchOptions = {
      doctorId,
      page,
      limit,
      patientId: query.patientId,
      courseId: query.courseId,
      clinicId: query.clinicId,
      visitId: query.visitId,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      method: query.method as PaymentMethod | undefined,
      refunded: query.refunded,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };

    const result = await this.paymentRepository.findPaginated(options);

    return {
      payments: result.payments.map((payment) => paymentToDto(payment)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}


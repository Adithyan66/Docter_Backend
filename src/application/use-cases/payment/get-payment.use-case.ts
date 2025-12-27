import { injectable, inject } from 'tsyringe';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository';
import { PaymentResponseDto } from '../../../presentation/dto/payment.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { paymentToDto } from '../../mappers/payment.mapper';
import { IGetPaymentUseCase } from '../../interfaces/use-cases/payment/payment-use-cases.interface';

@injectable()
export class GetPaymentUseCase implements IGetPaymentUseCase {
  constructor(@inject('IPaymentRepository') private readonly paymentRepository: IPaymentRepository) {}

  async execute(id: string, doctorId: string): Promise<PaymentResponseDto> {
    if (!id || id.trim().length === 0) {
      throw new ValidationError('Payment ID is required');
    }

    const payment = await this.paymentRepository.findByIdAndDoctor(id.trim(), doctorId);
    if (!payment) {
      throw new NotFoundError('Payment', id);
    }

    return paymentToDto(payment);
  }
}


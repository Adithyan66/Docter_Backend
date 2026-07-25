import { injectable, inject } from 'tsyringe';
import { ITransactionManager } from '../../interfaces/transaction-manager.interface';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { RefundDetails } from '../../../domain/entities/refund-details.entity';
import { RefundPaymentRequestDto, PaymentResponseDto } from '../../../presentation/dto/payment.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { paymentToDto } from '../../mappers/payment.mapper';
import { IRefundPaymentUseCase } from '../../interfaces/use-cases/payment/payment-use-cases.interface';

@injectable()
export class RefundPaymentUseCase implements IRefundPaymentUseCase {
  constructor(
    @inject('IPaymentRepository') private readonly paymentRepository: IPaymentRepository,
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository,
    @inject('ITransactionManager') private readonly txManager: ITransactionManager
  ) {}

  async execute(id: string, doctorId: string, input: RefundPaymentRequestDto): Promise<PaymentResponseDto> {
    if (!id || id.trim().length === 0) {
      throw new ValidationError('Payment ID is required');
    }

    const payment = await this.paymentRepository.findByIdAndDoctor(id.trim(), doctorId);
    if (!payment) {
      throw new NotFoundError('Payment', id);
    }

    if (payment.refunded) {
      throw new ValidationError('Payment is already refunded');
    }

    const refundAmount = input.refundAmount !== undefined ? input.refundAmount : payment.amount;
    if (refundAmount > payment.amount) {
      throw new ValidationError('Refund amount cannot exceed payment amount');
    }
    if (refundAmount <= 0) {
      throw new ValidationError('Refund amount must be greater than zero');
    }

    const refundDetails = new RefundDetails(new Date(), refundAmount, input.refundReason);

    return this.txManager.runInTransaction(async (tx) => {
      payment.markRefunded(refundDetails);

      const updated = await this.paymentRepository.update(payment.id, payment, tx);
      if (!updated) {
        throw new NotFoundError('Payment', id);
      }

      await this.treatmentCourseRepository.decrementTotalPaid(payment.courseId, refundAmount, tx);

      return paymentToDto(updated);
    });
  }
}


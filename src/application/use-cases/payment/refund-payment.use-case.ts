import { injectable, inject } from 'tsyringe';
import mongoose from 'mongoose';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { RefundDetails } from '../../../domain/entities/refund-details.entity';
import { RefundPaymentRequestDto, PaymentResponseDto } from '../../../presentation/dto/payment.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { paymentToDto } from '../../mappers/payment.mapper';
import { MongoPaymentRepository } from '../../../infrastructure/repositories/mongodb/payment.repository';

@injectable()
export class RefundPaymentUseCase {
  constructor(
    @inject('IPaymentRepository') private readonly paymentRepository: IPaymentRepository,
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository
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

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      payment.markRefunded(refundDetails);

      const mongoRepo = this.paymentRepository as MongoPaymentRepository;
      const updated = await mongoRepo.update(payment.id, payment, session);

      if (!updated) {
        throw new NotFoundError('Payment', id);
      }

      await this.treatmentCourseRepository.decrementTotalPaid(payment.courseId, refundAmount, session);

      await session.commitTransaction();
      return paymentToDto(updated);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}


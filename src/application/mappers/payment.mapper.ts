import { Payment } from '../../domain/entities/payment.entity';
import { PaymentResponseDto } from '../../presentation/dto/payment.dto';

export const paymentToDto = (payment: Payment): PaymentResponseDto => ({
  id: payment.id,
  doctorId: payment.doctorId,
  patientId: payment.patientId,
  courseId: payment.courseId,
  visitId: payment.visitId,
  clinicId: payment.clinicId,
  amount: payment.amount,
  method: payment.method.getValue(),
  reference: payment.reference,
  paidAt: payment.paidAt,
  refunded: payment.refunded,
  refundDetails: payment.refundDetails
    ? {
        refundedAt: payment.refundDetails.refundedAt,
        refundReason: payment.refundDetails.refundReason,
        refundAmount: payment.refundDetails.refundAmount,
      }
    : undefined,
  isDeleted: payment.isDeleted,
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt,
});


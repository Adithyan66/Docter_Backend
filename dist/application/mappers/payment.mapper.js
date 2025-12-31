"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentToDto = void 0;
const paymentToDto = (payment) => ({
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
exports.paymentToDto = paymentToDto;

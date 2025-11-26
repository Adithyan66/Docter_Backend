import { BaseEntity } from './base.entity';
import { PaymentMethodVO, PaymentMethod } from '../value-objects/payment-method.vo';
import { RefundDetails } from './refund-details.entity';

export class Payment extends BaseEntity {
  doctorId: string;
  patientId: string;
  courseId: string;
  visitId?: string;
  clinicId?: string;
  amount: number;
  method: PaymentMethodVO;
  reference?: string;
  paidAt: Date;
  refunded: boolean;
  refundDetails?: RefundDetails;
  isDeleted: boolean;

  constructor(
    id: string,
    doctorId: string,
    patientId: string,
    courseId: string,
    amount: number,
    method: PaymentMethodVO,
    paidAt: Date,
    createdAt?: Date,
    updatedAt?: Date,
    visitId?: string,
    clinicId?: string,
    reference?: string,
    refunded?: boolean,
    refundDetails?: RefundDetails,
    isDeleted?: boolean
  ) {
    super(id, createdAt, updatedAt);
    this.doctorId = doctorId;
    this.patientId = patientId;
    this.courseId = courseId;
    this.amount = amount;
    this.method = method;
    this.paidAt = paidAt;
    this.visitId = visitId;
    this.clinicId = clinicId;
    this.reference = reference;
    this.refunded = refunded || false;
    this.refundDetails = refundDetails;
    this.isDeleted = isDeleted !== undefined ? isDeleted : false;

    if (amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }
  }

  markRefunded(refundDetails: RefundDetails): void {
    if (this.refunded) {
      throw new Error('Payment is already refunded');
    }
    if (refundDetails.refundAmount > this.amount) {
      throw new Error('Refund amount cannot exceed payment amount');
    }
    this.refunded = true;
    this.refundDetails = refundDetails;
  }

  markDeleted(): void {
    this.isDeleted = true;
  }

  restore(): void {
    this.isDeleted = false;
  }
}


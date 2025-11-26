export class RefundDetails {
  refundedAt: Date;
  refundReason?: string;
  refundAmount: number;

  constructor(refundedAt: Date, refundAmount: number, refundReason?: string) {
    if (!refundedAt) {
      throw new Error('Refund date is required');
    }
    if (refundAmount < 0) {
      throw new Error('Refund amount cannot be negative');
    }
    this.refundedAt = refundedAt;
    this.refundAmount = refundAmount;
    this.refundReason = refundReason;
  }
}


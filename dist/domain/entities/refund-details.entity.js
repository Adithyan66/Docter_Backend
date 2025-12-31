"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundDetails = void 0;
class RefundDetails {
    constructor(refundedAt, refundAmount, refundReason) {
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
exports.RefundDetails = RefundDetails;

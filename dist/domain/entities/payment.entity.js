"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const base_entity_1 = require("./base.entity");
class Payment extends base_entity_1.BaseEntity {
    constructor(id, doctorId, patientId, courseId, amount, method, paidAt, createdAt, updatedAt, visitId, clinicId, reference, refunded, refundDetails, isDeleted) {
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
    markRefunded(refundDetails) {
        if (this.refunded) {
            throw new Error('Payment is already refunded');
        }
        if (refundDetails.refundAmount > this.amount) {
            throw new Error('Refund amount cannot exceed payment amount');
        }
        this.refunded = true;
        this.refundDetails = refundDetails;
    }
    markDeleted() {
        this.isDeleted = true;
    }
    restore() {
        this.isDeleted = false;
    }
}
exports.Payment = Payment;

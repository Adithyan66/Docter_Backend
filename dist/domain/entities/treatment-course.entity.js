"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreatmentCourse = void 0;
const base_entity_1 = require("./base.entity");
class TreatmentCourse extends base_entity_1.BaseEntity {
    constructor(id, doctorId, patientId, treatmentId, startDate, totalCost, createdAt, updatedAt, clinicId, expectedEndDate, lastVisitDate, nextVisitDate, totalPaid, isPaymentCompleted, isMedicallyCompleted, status, notes, visits, payments, isDeleted) {
        super(id, createdAt, updatedAt);
        this.doctorId = doctorId;
        this.patientId = patientId;
        this.treatmentId = treatmentId;
        this.startDate = startDate;
        this.totalCost = totalCost;
        this.clinicId = clinicId;
        this.expectedEndDate = expectedEndDate;
        this.lastVisitDate = lastVisitDate;
        this.nextVisitDate = nextVisitDate;
        this.totalPaid = totalPaid || 0;
        this.isPaymentCompleted = isPaymentCompleted || false;
        this.isMedicallyCompleted = isMedicallyCompleted || false;
        this.status = status || 'active';
        this.notes = notes;
        this.visits = visits || [];
        this.payments = payments || [];
        this.isDeleted = isDeleted || false;
        this.validateStatus(this.status);
    }
    get remaining() {
        return Math.max(0, this.totalCost - this.totalPaid);
    }
    recalcPaymentStatus() {
        this.isPaymentCompleted = this.totalPaid >= this.totalCost;
    }
    addPayment(amount) {
        if (amount < 0) {
            throw new Error('Payment amount cannot be negative');
        }
        this.totalPaid += amount;
        this.recalcPaymentStatus();
    }
    addToTotalCost(amount) {
        if (amount < 0) {
            throw new Error('Amount cannot be negative');
        }
        this.totalCost += amount;
        this.recalcPaymentStatus();
    }
    activate() {
        if (this.status === 'cancelled') {
            throw new Error('Cannot activate a cancelled treatment course');
        }
        this.status = 'active';
    }
    pause() {
        if (this.status === 'completed' || this.status === 'cancelled') {
            throw new Error('Cannot pause a completed or cancelled treatment course');
        }
        this.status = 'paused';
    }
    complete() {
        if (this.status === 'cancelled') {
            throw new Error('Cannot complete a cancelled treatment course');
        }
        this.status = 'completed';
        this.isMedicallyCompleted = true;
    }
    cancel() {
        this.status = 'cancelled';
    }
    markMedicallyCompleted() {
        if (this.status === 'cancelled') {
            throw new Error('Cannot mark a cancelled treatment course as medically completed');
        }
        this.isMedicallyCompleted = true;
        if (this.status === 'active' || this.status === 'paused') {
            this.status = 'completed';
        }
    }
    addVisit(visitId) {
        if (!this.visits.includes(visitId)) {
            this.visits.push(visitId);
        }
    }
    removeVisit(visitId) {
        this.visits = this.visits.filter(id => id !== visitId);
    }
    addPaymentReference(paymentId) {
        if (!this.payments.includes(paymentId)) {
            this.payments.push(paymentId);
        }
    }
    setNotes(notes) {
        this.notes = notes;
    }
    setExpectedEndDate(date) {
        this.expectedEndDate = date;
    }
    markDeleted() {
        this.isDeleted = true;
    }
    restore() {
        this.isDeleted = false;
    }
    validateStatus(status) {
        const validStatuses = ['active', 'paused', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid treatment course status');
        }
    }
}
exports.TreatmentCourse = TreatmentCourse;

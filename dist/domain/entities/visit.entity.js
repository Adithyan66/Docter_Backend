"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Visit = void 0;
const base_entity_1 = require("./base.entity");
class Visit extends base_entity_1.BaseEntity {
    constructor(id, doctorId, patientId, courseId, visitDate, createdAt, updatedAt, clinicId, notes, billedAmount, mediaIds, prescriptionId, isDeleted) {
        super(id, createdAt, updatedAt);
        this.doctorId = doctorId;
        this.patientId = patientId;
        this.courseId = courseId;
        this.clinicId = clinicId;
        this.visitDate = visitDate;
        this.notes = notes;
        this.billedAmount = billedAmount;
        this.mediaIds = mediaIds || [];
        this.prescriptionId = prescriptionId;
        this.isDeleted = isDeleted !== undefined ? isDeleted : false;
    }
    setNotes(notes) {
        this.notes = notes;
    }
    setBilledAmount(amount) {
        if (amount !== undefined && amount < 0) {
            throw new Error('Billed amount cannot be negative');
        }
        this.billedAmount = amount;
    }
    addMedia(mediaId) {
        if (!this.mediaIds.includes(mediaId)) {
            this.mediaIds.push(mediaId);
        }
    }
    removeMedia(mediaId) {
        this.mediaIds = this.mediaIds.filter((id) => id !== mediaId);
    }
    setPrescription(prescriptionId) {
        this.prescriptionId = prescriptionId;
    }
    markDeleted() {
        this.isDeleted = true;
    }
    restore() {
        this.isDeleted = false;
    }
}
exports.Visit = Visit;

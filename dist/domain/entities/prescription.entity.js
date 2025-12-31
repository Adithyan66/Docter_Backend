"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prescription = void 0;
const base_entity_1 = require("./base.entity");
class Prescription extends base_entity_1.BaseEntity {
    constructor(id, doctor, patient, visit, items, createdAt, updatedAt, clinic, diagnosis, notes) {
        super(id, createdAt, updatedAt);
        this.doctor = doctor;
        this.patient = patient;
        this.visit = visit;
        this.clinic = clinic;
        this.diagnosis = diagnosis || [];
        this.items = items || [];
        this.notes = notes;
    }
}
exports.Prescription = Prescription;

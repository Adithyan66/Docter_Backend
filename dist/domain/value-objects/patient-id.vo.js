"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientId = void 0;
class PatientId {
    constructor(id) {
        if (!id) {
            throw new Error('Patient ID is required');
        }
        const formatted = id.trim().toUpperCase();
        const regex = /^[A-Z]{3}-\d+$/;
        if (!regex.test(formatted)) {
            throw new Error('Invalid patient ID format');
        }
        this.value = formatted;
    }
    toString() {
        return this.value;
    }
    equals(other) {
        return this.value === other.value;
    }
}
exports.PatientId = PatientId;

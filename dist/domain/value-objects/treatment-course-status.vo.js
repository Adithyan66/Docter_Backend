"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreatmentCourseStatusVO = void 0;
class TreatmentCourseStatusVO {
    constructor(status) {
        if (!status) {
            throw new Error('Status is required');
        }
        if (status !== 'active' && status !== 'paused' && status !== 'completed' && status !== 'cancelled') {
            throw new Error('Invalid treatment course status');
        }
        this.value = status;
    }
    getValue() {
        return this.value;
    }
    toString() {
        return this.value;
    }
    equals(other) {
        return this.value === other.value;
    }
    isActive() {
        return this.value === 'active';
    }
    isPaused() {
        return this.value === 'paused';
    }
    isCompleted() {
        return this.value === 'completed';
    }
    isCancelled() {
        return this.value === 'cancelled';
    }
}
exports.TreatmentCourseStatusVO = TreatmentCourseStatusVO;

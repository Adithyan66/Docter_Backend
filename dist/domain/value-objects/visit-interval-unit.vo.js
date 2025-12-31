"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitIntervalUnitVO = void 0;
class VisitIntervalUnitVO {
    constructor(unit) {
        if (!unit) {
            throw new Error('Visit interval unit is required');
        }
        const validUnits = ['days', 'weeks', 'months', 'years'];
        if (!validUnits.includes(unit)) {
            throw new Error(`Invalid visit interval unit. Must be one of: ${validUnits.join(', ')}`);
        }
        this.value = unit;
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
    isDays() {
        return this.value === 'days';
    }
    isWeeks() {
        return this.value === 'weeks';
    }
    isMonths() {
        return this.value === 'months';
    }
    isYears() {
        return this.value === 'years';
    }
}
exports.VisitIntervalUnitVO = VisitIntervalUnitVO;

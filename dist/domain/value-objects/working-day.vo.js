"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkingDay = void 0;
class WorkingDay {
    constructor(day, startTime, endTime) {
        if (!day) {
            throw new Error('Day is required');
        }
        if (!startTime) {
            throw new Error('Start time is required');
        }
        if (!endTime) {
            throw new Error('End time is required');
        }
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(startTime)) {
            throw new Error('Invalid start time format. Expected HH:mm format');
        }
        if (!timeRegex.test(endTime)) {
            throw new Error('Invalid end time format. Expected HH:mm format');
        }
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
    }
    getDay() {
        return this.day;
    }
    getStartTime() {
        return this.startTime;
    }
    getEndTime() {
        return this.endTime;
    }
    toJSON() {
        return {
            day: this.day,
            startTime: this.startTime,
            endTime: this.endTime,
        };
    }
    equals(other) {
        return this.day === other.day && this.startTime === other.startTime && this.endTime === other.endTime;
    }
}
exports.WorkingDay = WorkingDay;

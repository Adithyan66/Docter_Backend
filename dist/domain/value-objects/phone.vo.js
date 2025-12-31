"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Phone = void 0;
class Phone {
    constructor(phone) {
        const normalized = phone.replace(/\s+/g, '');
        const phoneRegex = /^\+?[0-9]{7,15}$/;
        if (!phoneRegex.test(normalized)) {
            throw new Error('Invalid phone number format');
        }
        this.value = normalized;
    }
    toString() {
        return this.value;
    }
    equals(other) {
        return this.value === other.value;
    }
}
exports.Phone = Phone;

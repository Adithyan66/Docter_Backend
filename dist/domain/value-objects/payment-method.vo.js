"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodVO = void 0;
class PaymentMethodVO {
    constructor(method) {
        if (!method) {
            throw new Error('Payment method is required');
        }
        const validMethods = ['cash', 'card', 'upi', 'bank', 'insurance', 'online'];
        if (!validMethods.includes(method)) {
            throw new Error('Invalid payment method');
        }
        this.value = method;
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
    isCash() {
        return this.value === 'cash';
    }
    isCard() {
        return this.value === 'card';
    }
    isUpi() {
        return this.value === 'upi';
    }
    isBank() {
        return this.value === 'bank';
    }
    isInsurance() {
        return this.value === 'insurance';
    }
    isOnline() {
        return this.value === 'online';
    }
}
exports.PaymentMethodVO = PaymentMethodVO;

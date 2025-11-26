export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank' | 'insurance' | 'online';

export class PaymentMethodVO {
  private readonly value: PaymentMethod;

  constructor(method: PaymentMethod) {
    if (!method) {
      throw new Error('Payment method is required');
    }
    const validMethods: PaymentMethod[] = ['cash', 'card', 'upi', 'bank', 'insurance', 'online'];
    if (!validMethods.includes(method)) {
      throw new Error('Invalid payment method');
    }
    this.value = method;
  }

  getValue(): PaymentMethod {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: PaymentMethodVO): boolean {
    return this.value === other.value;
  }

  isCash(): boolean {
    return this.value === 'cash';
  }

  isCard(): boolean {
    return this.value === 'card';
  }

  isUpi(): boolean {
    return this.value === 'upi';
  }

  isBank(): boolean {
    return this.value === 'bank';
  }

  isInsurance(): boolean {
    return this.value === 'insurance';
  }

  isOnline(): boolean {
    return this.value === 'online';
  }
}


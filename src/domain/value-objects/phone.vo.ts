export class Phone {
  private readonly value: string;

  constructor(phone: string) {
    const normalized = phone.replace(/\s+/g, '');
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (!phoneRegex.test(normalized)) {
      throw new Error('Invalid phone number format');
    }
    this.value = normalized;
  }

  toString(): string {
    return this.value;
  }

  equals(other: Phone): boolean {
    return this.value === other.value;
  }
}



export class PatientId {
  private readonly value: string;

  constructor(id: string) {
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

  toString(): string {
    return this.value;
  }

  equals(other: PatientId): boolean {
    return this.value === other.value;
  }
}



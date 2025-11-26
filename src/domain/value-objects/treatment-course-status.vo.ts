export type TreatmentCourseStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export class TreatmentCourseStatusVO {
  private readonly value: TreatmentCourseStatus;

  constructor(status: TreatmentCourseStatus) {
    if (!status) {
      throw new Error('Status is required');
    }
    if (status !== 'active' && status !== 'paused' && status !== 'completed' && status !== 'cancelled') {
      throw new Error('Invalid treatment course status');
    }
    this.value = status;
  }

  getValue(): TreatmentCourseStatus {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: TreatmentCourseStatusVO): boolean {
    return this.value === other.value;
  }

  isActive(): boolean {
    return this.value === 'active';
  }

  isPaused(): boolean {
    return this.value === 'paused';
  }

  isCompleted(): boolean {
    return this.value === 'completed';
  }

  isCancelled(): boolean {
    return this.value === 'cancelled';
  }
}


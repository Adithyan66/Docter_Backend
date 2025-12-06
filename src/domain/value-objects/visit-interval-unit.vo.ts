export type VisitIntervalUnit = 'days' | 'weeks' | 'months' | 'years';

export class VisitIntervalUnitVO {
  private readonly value: VisitIntervalUnit;

  constructor(unit: VisitIntervalUnit) {
    if (!unit) {
      throw new Error('Visit interval unit is required');
    }
    const validUnits: VisitIntervalUnit[] = ['days', 'weeks', 'months', 'years'];
    if (!validUnits.includes(unit)) {
      throw new Error(`Invalid visit interval unit. Must be one of: ${validUnits.join(', ')}`);
    }
    this.value = unit;
  }

  getValue(): VisitIntervalUnit {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: VisitIntervalUnitVO): boolean {
    return this.value === other.value;
  }

  isDays(): boolean {
    return this.value === 'days';
  }

  isWeeks(): boolean {
    return this.value === 'weeks';
  }

  isMonths(): boolean {
    return this.value === 'months';
  }

  isYears(): boolean {
    return this.value === 'years';
  }
}


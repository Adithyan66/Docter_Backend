export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export class WorkingDay {
  private readonly day: DayOfWeek;
  private readonly startTime: string;
  private readonly endTime: string;

  constructor(day: DayOfWeek, startTime: string, endTime: string) {
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

  getDay(): DayOfWeek {
    return this.day;
  }

  getStartTime(): string {
    return this.startTime;
  }

  getEndTime(): string {
    return this.endTime;
  }

  toJSON(): { day: DayOfWeek; startTime: string; endTime: string } {
    return {
      day: this.day,
      startTime: this.startTime,
      endTime: this.endTime,
    };
  }

  equals(other: WorkingDay): boolean {
    return this.day === other.day && this.startTime === other.startTime && this.endTime === other.endTime;
  }
}


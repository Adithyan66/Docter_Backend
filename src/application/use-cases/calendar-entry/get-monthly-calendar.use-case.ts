import { injectable, inject } from 'tsyringe';
import {
  ICalendarEntryRepository,
  MonthlyCalendarDay,
} from '../../../domain/repositories/calendar-entry.repository';
import { ValidationError } from '../../../domain/errors/validation.error';
import { IGetMonthlyCalendarUseCase } from '../../interfaces/use-cases/calendar-entry/calendar-entry-use-cases.interface';

const pad = (n: number): string => String(n).padStart(2, '0');

@injectable()
export class GetMonthlyCalendarUseCase implements IGetMonthlyCalendarUseCase {
  constructor(
    @inject('ICalendarEntryRepository') private calendarEntryRepository: ICalendarEntryRepository
  ) {}

  async execute(doctorId: string, month: number, year: number): Promise<MonthlyCalendarDay[]> {
    if (month < 1 || month > 12) {
      throw new ValidationError('Month must be between 1 and 12');
    }
    if (year < 1900 || year > 2100) {
      throw new ValidationError('Year must be between 1900 and 2100');
    }

    // Day 0 of the next month is the last day of this one.
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const startDate = `${year}-${pad(month)}-01`;
    const endDate = `${year}-${pad(month)}-${pad(lastDay)}`;

    return this.calendarEntryRepository.findMonthlyCalendarData(startDate, endDate, doctorId);
  }
}

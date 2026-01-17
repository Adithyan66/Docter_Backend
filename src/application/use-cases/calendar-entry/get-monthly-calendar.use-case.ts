import { injectable, inject } from 'tsyringe';
import { ICalendarEntryRepository } from '../../../domain/repositories/calendar-entry.repository';
import { ValidationError } from '../../../domain/errors/validation.error';
import { IGetMonthlyCalendarUseCase } from '../../interfaces/use-cases/calendar-entry/calendar-entry-use-cases.interface';

@injectable()
export class GetMonthlyCalendarUseCase implements IGetMonthlyCalendarUseCase {
  constructor(
    @inject('ICalendarEntryRepository') private calendarEntryRepository: ICalendarEntryRepository
  ) {}

  async execute(doctorId: string, month: number, year: number): Promise<Array<{ date: string; clinics: string[] }>> {
    if (month < 1 || month > 12) {
      throw new ValidationError('Month must be between 1 and 12');
    }

    if (year < 1900 || year > 2100) {
      throw new ValidationError('Year must be between 1900 and 2100');
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return await this.calendarEntryRepository.findMonthlyCalendarData(startDate, endDate, doctorId);
  }
}


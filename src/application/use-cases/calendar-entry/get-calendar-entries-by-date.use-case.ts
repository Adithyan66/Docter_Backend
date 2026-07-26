import { injectable, inject } from 'tsyringe';
import {
  ICalendarEntryRepository,
  CalendarEntryDetail,
} from '../../../domain/repositories/calendar-entry.repository';
import { ValidationError } from '../../../domain/errors/validation.error';
import { IGetCalendarEntriesByDateUseCase } from '../../interfaces/use-cases/calendar-entry/calendar-entry-use-cases.interface';
import { DATE_REGEX } from './appointment-validation.util';

@injectable()
export class GetCalendarEntriesByDateUseCase implements IGetCalendarEntriesByDateUseCase {
  constructor(
    @inject('ICalendarEntryRepository') private calendarEntryRepository: ICalendarEntryRepository
  ) {}

  async execute(doctorId: string, date: string): Promise<CalendarEntryDetail[]> {
    if (!DATE_REGEX.test(date)) {
      throw new ValidationError('Invalid date format. Use YYYY-MM-DD format');
    }

    const result = await this.calendarEntryRepository.findByDateWithDetails(date, doctorId);
    return result.map((entry) => ({ ...entry, appointments: entry.appointments || [] }));
  }
}

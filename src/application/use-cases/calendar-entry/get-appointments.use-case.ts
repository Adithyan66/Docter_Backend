import { injectable, inject } from 'tsyringe';
import { ICalendarEntryRepository } from '../../../domain/repositories/calendar-entry.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { IGetAppointmentsUseCase } from '../../interfaces/use-cases/calendar-entry/calendar-entry-use-cases.interface';
import { CalendarEntry } from '../../../domain/entities/calendar-entry.entity';

@injectable()
export class GetAppointmentsUseCase implements IGetAppointmentsUseCase {
  constructor(
    @inject('ICalendarEntryRepository') private calendarEntryRepository: ICalendarEntryRepository
  ) {}

  async execute(entryId: string, doctorId: string): Promise<CalendarEntry> {
    const entry = await this.calendarEntryRepository.findById(entryId);
    if (!entry || entry.doctorId !== doctorId) {
      throw new NotFoundError('CalendarEntry', entryId);
    }
    return entry;
  }
}

import { injectable, inject } from 'tsyringe';
import { ICalendarEntryRepository } from '../../../domain/repositories/calendar-entry.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { IDeleteCalendarEntryUseCase } from '../../interfaces/use-cases/calendar-entry/calendar-entry-use-cases.interface';

@injectable()
export class DeleteCalendarEntryUseCase implements IDeleteCalendarEntryUseCase {
  constructor(
    @inject('ICalendarEntryRepository') private calendarEntryRepository: ICalendarEntryRepository
  ) {}

  async execute(id: string, doctorId: string): Promise<void> {
    const entry = await this.calendarEntryRepository.findById(id);
    if (!entry) {
      throw new NotFoundError('CalendarEntry', id);
    }

    if (entry.doctorId !== doctorId) {
      throw new NotFoundError('CalendarEntry', id);
    }

    await this.calendarEntryRepository.delete(id);
  }
}


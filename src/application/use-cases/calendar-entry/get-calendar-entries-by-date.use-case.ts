import { injectable, inject } from 'tsyringe';
import { ICalendarEntryRepository } from '../../../domain/repositories/calendar-entry.repository';
import { ValidationError } from '../../../domain/errors/validation.error';
import { IGetCalendarEntriesByDateUseCase } from '../../interfaces/use-cases/calendar-entry/calendar-entry-use-cases.interface';

@injectable()
export class GetCalendarEntriesByDateUseCase implements IGetCalendarEntriesByDateUseCase {
  constructor(
    @inject('ICalendarEntryRepository') private calendarEntryRepository: ICalendarEntryRepository
  ) {}

  async execute(doctorId: string, date: string): Promise<Array<{
    id: string;
    clinic: { id: string; name: string };
    startTime: string;
    endTime: string;
    notes?: string;
    appointments: Array<{
      patientId: string;
      patient: { id: string; fullName: string; mobile?: string; email?: string; profilePicUrl?: string; patientId?: string };
      treatmentId?: string;
      treatment?: { id: string; name: string };
      startTime: string;
      endTime: string;
      notes?: string;
      completed: boolean;
    }>;
  }>> {
    const dateRegex = /^\d{4}-\d{2}-\d{2}/;
    if (!dateRegex.test(date)) {
      throw new ValidationError('Invalid date format. Use YYYY-MM-DD format');
    }

    const entryDate = new Date(date);
    const result = await this.calendarEntryRepository.findByDateWithDetails(entryDate, doctorId);

    return result.map(entry => ({
      ...entry,
      appointments: entry.appointments || [],
    }));
  }
}


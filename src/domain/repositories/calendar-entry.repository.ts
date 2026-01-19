import { BaseRepository } from './base.repository';
import { CalendarEntry } from '../entities/calendar-entry.entity';

export interface ICalendarEntryRepository extends BaseRepository<CalendarEntry> {
  findByDate(date: Date, doctorId: string): Promise<CalendarEntry[]>;
  findByDateRange(startDate: Date, endDate: Date, doctorId: string): Promise<CalendarEntry[]>;
  findByDateAndId(id: string, date: Date, doctorId: string): Promise<CalendarEntry | null>;
  findOverlappingEntries(date: Date, doctorId: string, startTime: string, endTime: string, excludeId?: string): Promise<CalendarEntry[]>;
  findMonthlyCalendarData(startDate: Date, endDate: Date, doctorId: string): Promise<Array<{ date: string; clinics: string[] }>>;
  findByDateWithDetails(date: Date, doctorId: string): Promise<Array<{
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
  }>>;
}


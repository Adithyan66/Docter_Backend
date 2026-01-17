import { BaseRepository } from './base.repository';
import { CalendarEntry } from '../entities/calendar-entry.entity';

export interface ICalendarEntryRepository extends BaseRepository<CalendarEntry> {
  findByDate(date: Date, doctorId: string): Promise<CalendarEntry[]>;
  findByDateRange(startDate: Date, endDate: Date, doctorId: string): Promise<CalendarEntry[]>;
  findByDateAndId(id: string, date: Date, doctorId: string): Promise<CalendarEntry | null>;
  findOverlappingEntries(date: Date, doctorId: string, startTime: string, endTime: string, excludeId?: string): Promise<CalendarEntry[]>;
  findMonthlyCalendarData(startDate: Date, endDate: Date, doctorId: string): Promise<Array<{ date: string; clinics: string[] }>>;
}


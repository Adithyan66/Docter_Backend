import { BaseRepository } from './base.repository';
import { CalendarEntry } from '../entities/calendar-entry.entity';

export interface CalendarEntryAppointmentDetail {
  patientId: string;
  patient: {
    id: string;
    fullName: string;
    mobile?: string;
    email?: string;
    profilePicUrl?: string;
    patientId?: string;
  };
  treatmentId?: string;
  treatment?: { id: string; name: string };
  startTime?: string;
  endTime?: string;
  notes?: string;
  completed: boolean;
}

export interface CalendarEntryDetail {
  id: string;
  clinic: { id: string; name: string };
  startTime: string;
  endTime: string;
  notes?: string;
  appointments: CalendarEntryAppointmentDetail[];
}

export interface MonthlyCalendarDay {
  date: string;
  clinics: string[];
}

/** Dates are YYYY-MM-DD strings; see CalendarEntry for why. */
export interface ICalendarEntryRepository extends BaseRepository<CalendarEntry> {
  findByDate(date: string, doctorId: string): Promise<CalendarEntry[]>;
  findByDateRange(startDate: string, endDate: string, doctorId: string): Promise<CalendarEntry[]>;
  findByDateAndId(id: string, date: string, doctorId: string): Promise<CalendarEntry | null>;
  findOverlappingEntries(
    date: string,
    doctorId: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<CalendarEntry[]>;
  findMonthlyCalendarData(
    startDate: string,
    endDate: string,
    doctorId: string
  ): Promise<MonthlyCalendarDay[]>;
  findByDateWithDetails(date: string, doctorId: string): Promise<CalendarEntryDetail[]>;
}

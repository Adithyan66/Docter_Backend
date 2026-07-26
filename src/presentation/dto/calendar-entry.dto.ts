import { CalendarEntryDetail } from '../../domain/repositories/calendar-entry.repository';

export interface AppointmentDto {
  patientId: string;
  treatmentId?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  completed?: boolean;
}

export interface CreateCalendarEntryRequestDto {
  date: string;
  clinicId: string;
  startTime: string;
  endTime: string;
  notes?: string;
  appointments?: AppointmentDto[];
}

export interface UpdateCalendarEntryRequestDto {
  date?: string;
  clinicId?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  appointments?: AppointmentDto[];
}

export interface CalendarEntryResponseDto {
  id: string;
  doctorId: string;
  /** YYYY-MM-DD — a calendar date, not an instant. */
  date: string;
  clinicId: string;
  startTime: string;
  endTime: string;
  notes?: string;
  appointments: Array<{
    patientId: string;
    treatmentId?: string;
    startTime?: string;
    endTime?: string;
    notes?: string;
    completed: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEntryByDateResponseDto {
  date: string;
  entries: CalendarEntryDetail[];
}

export interface MonthlyCalendarResponseDto {
  month: number;
  monthName: string;
  year: number;
  days: Array<{ date: string; clinics: string[] }>;
}

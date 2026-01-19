import { CalendarEntry } from '../../../../domain/entities/calendar-entry.entity';

export interface AppointmentInput {
  patientId: string;
  treatmentId?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  completed?: boolean;
}

export interface CreateCalendarEntryInput {
  date: string;
  clinicId: string;
  startTime: string;
  endTime: string;
  notes?: string;
  appointments?: AppointmentInput[];
}

export interface UpdateCalendarEntryInput {
  date?: string;
  clinicId?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  appointments?: AppointmentInput[];
}

export interface ICreateCalendarEntryUseCase {
  execute(doctorId: string, input: CreateCalendarEntryInput): Promise<void>;
}

export interface IUpdateCalendarEntryUseCase {
  execute(id: string, doctorId: string, input: UpdateCalendarEntryInput): Promise<void>;
}

export interface IDeleteCalendarEntryUseCase {
  execute(id: string, doctorId: string): Promise<void>;
}

export interface IGetCalendarEntryUseCase {
  execute(id: string, doctorId: string): Promise<CalendarEntry>;
}

export interface IAddAppointmentUseCase {
  execute(entryId: string, doctorId: string, appointment: AppointmentInput): Promise<void>;
}

export interface IUpdateAppointmentUseCase {
  execute(entryId: string, doctorId: string, appointmentIndex: number, appointment: AppointmentInput): Promise<void>;
}

export interface IDeleteAppointmentUseCase {
  execute(entryId: string, doctorId: string, appointmentIndex: number): Promise<void>;
}

export interface IGetAppointmentsUseCase {
  execute(entryId: string, doctorId: string): Promise<CalendarEntry>;
}

export interface IGetMonthlyCalendarUseCase {
  execute(doctorId: string, month: number, year: number): Promise<Array<{ date: string; clinics: string[] }>>;
}

export interface IGetCalendarEntriesByDateUseCase {
  execute(doctorId: string, date: string): Promise<Array<{
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

export interface IToggleAppointmentCompletedUseCase {
  execute(entryId: string, doctorId: string, appointmentIndex: number): Promise<void>;
}


import { BaseEntity } from './base.entity';

export interface Appointment {
  patientId: string;
  treatmentId?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  completed?: boolean;
}

/**
 * `date` is a calendar date in YYYY-MM-DD form, not an instant. A clinic session on
 * the 26th is on the 26th regardless of the reader's timezone, and Workers always
 * run UTC — storing a Date here would silently shift entries for non-UTC users.
 * Times are HH:mm strings, so lexicographic comparison is also chronological.
 */
export class CalendarEntry extends BaseEntity {
  doctorId: string;
  date: string;
  clinicId: string;
  startTime: string;
  endTime: string;
  notes?: string;
  appointments: Appointment[];

  constructor(
    id: string,
    doctorId: string,
    date: string,
    clinicId: string,
    startTime: string,
    endTime: string,
    appointments: Appointment[],
    createdAt?: Date,
    updatedAt?: Date,
    notes?: string
  ) {
    super(id, createdAt, updatedAt);
    this.doctorId = doctorId;
    this.date = date;
    this.clinicId = clinicId;
    this.startTime = startTime;
    this.endTime = endTime;
    this.appointments = appointments;
    this.notes = notes;

    if (endTime <= startTime) {
      throw new Error('endTime must be after startTime');
    }
  }
}

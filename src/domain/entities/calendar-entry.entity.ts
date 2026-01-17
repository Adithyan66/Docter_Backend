import { BaseEntity } from './base.entity';

export interface Appointment {
  patientId: string;
  treatmentId?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  completed?: boolean;
}

export class CalendarEntry extends BaseEntity {
  doctorId: string;
  date: Date;
  clinicId: string;
  startTime: string;
  endTime: string;
  notes?: string;
  appointments: Appointment[];

  constructor(
    id: string,
    doctorId: string,
    date: Date,
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


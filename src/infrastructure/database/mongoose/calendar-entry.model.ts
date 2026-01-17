import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment {
  patientId: string;
  treatmentId?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  completed?: boolean;
}

export interface ICalendarEntry extends Document {
  doctor: mongoose.Types.ObjectId;
  date: Date;
  clinic: mongoose.Types.ObjectId;
  startTime: string;
  endTime: string;
  notes?: string;
  appointments: IAppointment[];
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: String, required: true },
    treatmentId: { type: String, required: false },
    startTime: { type: String, required: false },
    endTime: { type: String, required: false },
    notes: { type: String, required: false },
    completed: { type: Boolean, required: false, default: false },
  },
  { _id: false }
);

const CalendarEntrySchema = new Schema<ICalendarEntry>(
  {
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    date: { type: Date, required: true, index: true },
    clinic: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    notes: { type: String, required: false },
    appointments: { type: [AppointmentSchema], required: true },
  },
  {
    timestamps: true,
  }
);

CalendarEntrySchema.index({ doctor: 1, date: 1 });
CalendarEntrySchema.index({ doctor: 1, date: 1, startTime: 1, endTime: 1 });
CalendarEntrySchema.index({ doctor: 1, date: 1, clinic: 1 });

export const CalendarEntryModel = mongoose.model<ICalendarEntry>('CalendarEntry', CalendarEntrySchema);


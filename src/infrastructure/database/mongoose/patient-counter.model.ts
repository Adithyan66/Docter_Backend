import mongoose, { Schema, Document } from 'mongoose';

export type IPatientIdCounter = Document & {
  _id: string; // clinicId (3 letters)
  sequence: number;
  updatedAt: Date;
};

const PatientIdCounterSchema = new Schema<IPatientIdCounter>(
  {
    _id: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    sequence: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

export const PatientIdCounterModel = mongoose.model<IPatientIdCounter>('PatientIdCounter', PatientIdCounterSchema, 'patient_id_counters');



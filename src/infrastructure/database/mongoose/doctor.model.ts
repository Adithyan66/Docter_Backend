import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const DoctorModel = mongoose.model<IDoctor>('Doctor', DoctorSchema);


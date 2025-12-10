import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStaff extends Document {
  username: string;
  password: string;
  clinicId: Types.ObjectId;
  doctorId: Types.ObjectId;
  role: 'staff';
  refreshToken?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    role: { type: String, required: true, default: 'staff' },
    refreshToken: { type: String, required: false },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

export const StaffModel = mongoose.model<IStaff>('Staff', StaffSchema);



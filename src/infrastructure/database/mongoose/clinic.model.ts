import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkingDay {
  day: string;
  startTime: string;
  endTime: string;
}

export interface IClinic extends Document {
  clinicId: string;
  doctor: mongoose.Types.ObjectId;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  locationUrl?: string;
  workingDays?: IWorkingDay[];
  treatments?: mongoose.Types.ObjectId[];
  images?: string[];
  notes?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WorkingDaySchema = new Schema<IWorkingDay>(
  {
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const ClinicSchema = new Schema<IClinic>(
  {
    clinicId: {
      type: String,
      required: true,
      immutable: true,
      uppercase: true,
      validate: {
        validator: function(v: string) {
          return /^[A-Z]{3}$/.test(v);
        },
        message: 'clinicId must be exactly 3 capital letters'
      }
    },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    name: { type: String, required: true },
    address: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    pincode: { type: String, required: false },
    phone: { type: String, required: false },
    email: { type: String, required: false },
    website: { type: String, required: false },
    locationUrl: { type: String, required: false },
    workingDays: { type: [WorkingDaySchema], required: false, default: [] },
    treatments: [{ type: Schema.Types.ObjectId, ref: 'Treatment' }],
    images: { type: [String], required: false, default: [] },
    notes: { type: String, required: false },
    isActive: { type: Boolean, required: false, default: true },
    isDeleted: { type: Boolean, required: false, default: false },
  },
  {
    timestamps: true,
  }
);

ClinicSchema.index({ isDeleted: 1, createdAt: -1 });
ClinicSchema.index({ doctor: 1, name: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
ClinicSchema.index({ doctor: 1, clinicId: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
ClinicSchema.index({ name: 'text', city: 'text' });

export const ClinicModel = mongoose.model<IClinic>('Clinic', ClinicSchema);


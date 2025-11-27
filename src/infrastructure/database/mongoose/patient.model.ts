import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  doctor: mongoose.Types.ObjectId;
  primaryClinic?: mongoose.Types.ObjectId;
  clinics?: mongoose.Types.ObjectId[];
  patientId?: string;
  firstName: string;
  lastName?: string;
  fullName: string;
  dob?: Date;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  phone?: string;
  email?: string;
  address?: string;
  profilePicUrl?: string;
  consultationType: 'one-time' | 'treatment-plan';
  tags?: string[];
  treatmentCourses?: mongoose.Types.ObjectId[];
  visitCount?: number;
  lastVisitAt?: Date;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    primaryClinic: { type: Schema.Types.ObjectId, ref: 'Clinic' },
    clinics: [{ type: Schema.Types.ObjectId, ref: 'Clinic' }],
    patientId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    fullName: { type: String, trim: true },
    dob: { type: Date },
    age: { type: Number },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'unknown'],
      default: 'unknown',
    },
    phone: { type: String, index: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String, trim: true },
    profilePicUrl: { type: String, trim: true },
    consultationType: {
      type: String,
      enum: ['one-time', 'treatment-plan'],
      required: true,
    },
    tags: { type: [String], default: [] },
    treatmentCourses: [{ type: Schema.Types.ObjectId, ref: 'TreatmentCourse' }],
    visitCount: { type: Number, default: 0 },
    lastVisitAt: { type: Date },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PatientSchema.index({ fullName: 'text' });
PatientSchema.index({ doctor: 1, isDeleted: 1 });
PatientSchema.index(
  { doctor: 1, phone: 1 },
  { partialFilterExpression: { phone: { $exists: true } } }
);

PatientSchema.pre('save', function (next) {
  if (!this.fullName) {
    this.fullName = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
  if (this.dob) {
    const today = new Date();
    let age = today.getFullYear() - this.dob.getFullYear();
    const monthDiff = today.getMonth() - this.dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.dob.getDate())) {
      age -= 1;
    }
    this.age = age;
  }
  next();
});

export const PatientModel = mongoose.model<IPatient>('Patient', PatientSchema);



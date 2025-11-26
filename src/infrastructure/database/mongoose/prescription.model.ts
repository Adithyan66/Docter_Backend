import mongoose, { Schema, Document } from 'mongoose';

export interface IPrescriptionItem {
  medicineName: string;
  form?: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  notes?: string;
}

export interface IPrescription extends Document {
  doctor: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  visit: mongoose.Types.ObjectId;
  clinic?: mongoose.Types.ObjectId;
  diagnosis?: string[];
  items: IPrescriptionItem[];
  notes?: string;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionItemSchema = new Schema<IPrescriptionItem>(
  {
    medicineName: { type: String, required: true },
    form: { type: String },
    strength: { type: String },
    dosage: { type: String },
    frequency: { type: String },
    duration: { type: String },
    notes: { type: String },
  },
  { _id: false }
);

const PrescriptionSchema = new Schema<IPrescription>(
  {
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    visit: { type: Schema.Types.ObjectId, ref: 'Visit', required: true },
    clinic: { type: Schema.Types.ObjectId, ref: 'Clinic' },
    diagnosis: { type: [String], default: [] },
    items: { type: [PrescriptionItemSchema], default: [] },
    notes: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PrescriptionSchema.index({ doctor: 1, patient: 1, createdAt: -1 });
PrescriptionSchema.index({ doctor: 1, visit: 1 });

export const PrescriptionModel = mongoose.model<IPrescription>('Prescription', PrescriptionSchema);


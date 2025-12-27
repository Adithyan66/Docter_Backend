import mongoose, { Schema, Document } from 'mongoose';

export interface IVisit extends Document {
  doctor: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  clinic?: mongoose.Types.ObjectId;
  visitDate: Date;
  notes?: string;
  billedAmount?: number;
  media?: mongoose.Types.ObjectId[];
  prescription?: mongoose.Types.ObjectId;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VisitSchema = new Schema<IVisit>(
  {
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'TreatmentCourse', required: true },
    clinic: { type: Schema.Types.ObjectId, ref: 'Clinic' },
    visitDate: { type: Date, required: true, default: Date.now },
    notes: { type: String },
    billedAmount: { type: Number, default: 0 },
    media: [{ type: Schema.Types.ObjectId, ref: 'Media' }],
    prescription: { type: Schema.Types.ObjectId, ref: 'Prescription' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

VisitSchema.index({ doctor: 1, patient: 1, visitDate: -1 });
VisitSchema.index({ course: 1 });
VisitSchema.index({ clinic: 1 });

export const VisitModel = mongoose.model<IVisit>('Visit', VisitSchema);


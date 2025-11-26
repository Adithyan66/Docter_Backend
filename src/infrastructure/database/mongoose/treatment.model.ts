import mongoose, { Schema, Document } from 'mongoose';

export interface ITreatment extends Document {
  doctor: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  minDuration?: number;
  maxDuration?: number;
  avgDuration?: number;
  minFees?: number;
  maxFees?: number;
  avgFees?: number;
  steps?: string[];
  aftercare?: string[];
  followUpRequired?: boolean;
  followUpAfterDays?: number;
  risks?: string[];
  images?: string[];
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TreatmentSchema = new Schema<ITreatment>(
  {
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: false },
    minDuration: { type: Number, required: false },
    maxDuration: { type: Number, required: false },
    avgDuration: { type: Number, required: false },
    minFees: { type: Number, required: false },
    maxFees: { type: Number, required: false },
    avgFees: { type: Number, required: false },
    steps: { type: [String], required: false, default: [] },
    aftercare: { type: [String], required: false, default: [] },
    followUpRequired: { type: Boolean, required: false, default: false },
    followUpAfterDays: { type: Number, required: false },
    risks: { type: [String], required: false, default: [] },
    images: { type: [String], required: false, default: [] },
    isDeleted: { type: Boolean, required: false, default: false },
  },
  {
    timestamps: true,
  }
);

TreatmentSchema.index({ isDeleted: 1, createdAt: -1 });
TreatmentSchema.index({ isDeleted: 1, avgFees: -1 });
TreatmentSchema.index({ isDeleted: 1, avgDuration: -1 });
TreatmentSchema.index({ isDeleted: 1, name: 'text', description: 'text' });
TreatmentSchema.index({ doctor: 1, name: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

export const TreatmentModel = mongoose.model<ITreatment>('Treatment', TreatmentSchema);


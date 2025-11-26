import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia extends Document {
  doctor: mongoose.Types.ObjectId;
  patient?: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  visit?: mongoose.Types.ObjectId;
  clinic?: mongoose.Types.ObjectId;
  url: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  type?: 'image' | 'xray' | 'report' | 'other';
  notes?: string;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient' },
    course: { type: Schema.Types.ObjectId, ref: 'TreatmentCourse' },
    visit: { type: Schema.Types.ObjectId, ref: 'Visit' },
    clinic: { type: Schema.Types.ObjectId, ref: 'Clinic' },
    url: { type: String, required: true },
    filename: { type: String },
    mimeType: { type: String },
    size: { type: Number },
    type: { type: String, enum: ['image', 'xray', 'report', 'other'], default: 'image' },
    notes: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MediaSchema.index({ doctor: 1, clinic: 1, visit: 1 });
MediaSchema.index({ doctor: 1, patient: 1 });
MediaSchema.index({ doctor: 1, course: 1 });
MediaSchema.index({ type: 1 });
MediaSchema.index({ isDeleted: 1, createdAt: -1 });

export const MediaModel = mongoose.model<IMedia>('Media', MediaSchema);


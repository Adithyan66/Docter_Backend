import mongoose, { Schema, Document } from 'mongoose';

export interface ITreatmentCourse extends Document {
  doctor: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  clinic?: mongoose.Types.ObjectId;
  treatment: mongoose.Types.ObjectId;
  startDate: Date;
  expectedEndDate?: Date;
  lastVisitDate?: Date;
  nextVisitDate?: Date;
  totalCost: number;
  totalPaid: number;
  isPaymentCompleted: boolean;
  isMedicallyCompleted: boolean;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  notes?: string;
  visits?: mongoose.Types.ObjectId[];
  payments?: mongoose.Types.ObjectId[];
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TreatmentCourseSchema = new Schema<ITreatmentCourse>(
  {
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    clinic: { type: Schema.Types.ObjectId, ref: 'Clinic' },
    treatment: { type: Schema.Types.ObjectId, ref: 'Treatment', required: true },
    startDate: { type: Date, required: true },
    expectedEndDate: { type: Date },
    lastVisitDate: { type: Date },
    nextVisitDate: { type: Date },
    totalCost: { type: Number, default: 0, min: 0 },
    totalPaid: { type: Number, default: 0, min: 0 },
    isPaymentCompleted: { type: Boolean, default: false },
    isMedicallyCompleted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'cancelled'],
      default: 'active',
    },
    notes: { type: String },
    visits: [{ type: Schema.Types.ObjectId, ref: 'Visit' }],
    payments: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TreatmentCourseSchema.virtual('remaining').get(function (this: ITreatmentCourse) {
  return Math.max(0, (this.totalCost || 0) - (this.totalPaid || 0));
});

TreatmentCourseSchema.index({ doctor: 1, patient: 1, status: 1 });
TreatmentCourseSchema.index({ clinic: 1, startDate: -1 });
TreatmentCourseSchema.index({ isDeleted: 1, createdAt: -1 });
TreatmentCourseSchema.index({ lastVisitDate: -1 });
TreatmentCourseSchema.index({ nextVisitDate: 1 });

TreatmentCourseSchema.methods.recalcPaymentStatus = async function () {
  const tc = this as ITreatmentCourse;
  tc.isPaymentCompleted = tc.totalPaid >= tc.totalCost;
  await tc.save();
};

TreatmentCourseSchema.statics.addPayment = async function (
  courseId: mongoose.Types.ObjectId,
  amount: number,
  session?: mongoose.ClientSession
) {
  const update = { $inc: { totalPaid: amount } };
  const opts: any = { new: true };
  if (session) opts.session = session;
  const updated = await (this as any).findByIdAndUpdate(courseId, update, opts);
  if (updated) {
    updated.isPaymentCompleted = updated.totalPaid >= updated.totalCost;
    await updated.save(opts);
  }
  return updated;
};

export const TreatmentCourseModel = mongoose.model<ITreatmentCourse>('TreatmentCourse', TreatmentCourseSchema);


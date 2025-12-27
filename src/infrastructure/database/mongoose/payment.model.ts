import mongoose, { Schema, Document } from 'mongoose';
import { PaymentMethod } from '../../../domain/value-objects/payment-method.vo';

export interface IPayment extends Document {
  doctor: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  visit?: mongoose.Types.ObjectId;
  clinic?: mongoose.Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  paidAt: Date;
  refunded: boolean;
  refundDetails?: {
    refundedAt: Date;
    refundReason?: string;
    refundAmount: number;
  };
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'TreatmentCourse', required: true },
    visit: { type: Schema.Types.ObjectId, ref: 'Visit' },
    clinic: { type: Schema.Types.ObjectId, ref: 'Clinic' },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank', 'insurance', 'online'],
      default: 'cash',
    },
    reference: { type: String },
    paidAt: { type: Date, default: Date.now },
    refunded: { type: Boolean, default: false },
    refundDetails: {
      refundedAt: { type: Date },
      refundReason: { type: String },
      refundAmount: { type: Number },
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PaymentSchema.index({ doctor: 1, clinic: 1, paidAt: -1 });
PaymentSchema.index({ doctor: 1, patient: 1 });
PaymentSchema.index({ course: 1 });
PaymentSchema.index({ isDeleted: 1, createdAt: -1 });

export const PaymentModel = mongoose.model<IPayment>('Payment', PaymentSchema);


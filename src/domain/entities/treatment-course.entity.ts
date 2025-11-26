import { BaseEntity } from './base.entity';
import { TreatmentCourseStatus, TreatmentCourseStatusVO } from '../value-objects/treatment-course-status.vo';

export class TreatmentCourse extends BaseEntity {
  doctorId: string;
  patientId: string;
  clinicId?: string;
  treatmentId: string;
  startDate: Date;
  expectedEndDate?: Date;
  totalCost: number;
  totalPaid: number;
  isPaymentCompleted: boolean;
  isMedicallyCompleted: boolean;
  status: TreatmentCourseStatus;
  notes?: string;
  visits: string[];
  payments: string[];
  isDeleted: boolean;

  constructor(
    id: string,
    doctorId: string,
    patientId: string,
    treatmentId: string,
    startDate: Date,
    totalCost: number,
    createdAt?: Date,
    updatedAt?: Date,
    clinicId?: string,
    expectedEndDate?: Date,
    totalPaid?: number,
    isPaymentCompleted?: boolean,
    isMedicallyCompleted?: boolean,
    status?: TreatmentCourseStatus,
    notes?: string,
    visits?: string[],
    payments?: string[],
    isDeleted?: boolean
  ) {
    super(id, createdAt, updatedAt);
    this.doctorId = doctorId;
    this.patientId = patientId;
    this.treatmentId = treatmentId;
    this.startDate = startDate;
    this.totalCost = totalCost;
    this.clinicId = clinicId;
    this.expectedEndDate = expectedEndDate;
    this.totalPaid = totalPaid || 0;
    this.isPaymentCompleted = isPaymentCompleted || false;
    this.isMedicallyCompleted = isMedicallyCompleted || false;
    this.status = status || 'active';
    this.notes = notes;
    this.visits = visits || [];
    this.payments = payments || [];
    this.isDeleted = isDeleted || false;
    this.validateStatus(this.status);
  }

  get remaining(): number {
    return Math.max(0, this.totalCost - this.totalPaid);
  }

  recalcPaymentStatus(): void {
    this.isPaymentCompleted = this.totalPaid >= this.totalCost;
  }

  addPayment(amount: number): void {
    if (amount < 0) {
      throw new Error('Payment amount cannot be negative');
    }
    this.totalPaid += amount;
    this.recalcPaymentStatus();
  }

  activate(): void {
    if (this.status === 'cancelled') {
      throw new Error('Cannot activate a cancelled treatment course');
    }
    this.status = 'active';
  }

  pause(): void {
    if (this.status === 'completed' || this.status === 'cancelled') {
      throw new Error('Cannot pause a completed or cancelled treatment course');
    }
    this.status = 'paused';
  }

  complete(): void {
    if (this.status === 'cancelled') {
      throw new Error('Cannot complete a cancelled treatment course');
    }
    this.status = 'completed';
    this.isMedicallyCompleted = true;
  }

  cancel(): void {
    this.status = 'cancelled';
  }

  markMedicallyCompleted(): void {
    if (this.status === 'cancelled') {
      throw new Error('Cannot mark a cancelled treatment course as medically completed');
    }
    this.isMedicallyCompleted = true;
    if (this.status === 'active' || this.status === 'paused') {
      this.status = 'completed';
    }
  }

  addVisit(visitId: string): void {
    if (!this.visits.includes(visitId)) {
      this.visits.push(visitId);
    }
  }

  addPaymentReference(paymentId: string): void {
    if (!this.payments.includes(paymentId)) {
      this.payments.push(paymentId);
    }
  }

  setNotes(notes?: string): void {
    this.notes = notes;
  }

  setExpectedEndDate(date?: Date): void {
    this.expectedEndDate = date;
  }

  markDeleted(): void {
    this.isDeleted = true;
  }

  restore(): void {
    this.isDeleted = false;
  }

  private validateStatus(status: TreatmentCourseStatus): void {
    const validStatuses: TreatmentCourseStatus[] = ['active', 'paused', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid treatment course status');
    }
  }
}


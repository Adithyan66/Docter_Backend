import { BaseEntity } from './base.entity';

export class Visit extends BaseEntity {
  doctorId: string;
  patientId: string;
  courseId: string;
  clinicId?: string;
  visitDate: Date;
  notes?: string;
  billedAmount?: number;
  mediaIds: string[];
  prescriptionId?: string;
  isDeleted: boolean;

  constructor(
    id: string,
    doctorId: string,
    patientId: string,
    courseId: string,
    visitDate: Date,
    createdAt?: Date,
    updatedAt?: Date,
    clinicId?: string,
    notes?: string,
    billedAmount?: number,
    mediaIds?: string[],
    prescriptionId?: string,
    isDeleted?: boolean
  ) {
    super(id, createdAt, updatedAt);
    this.doctorId = doctorId;
    this.patientId = patientId;
    this.courseId = courseId;
    this.clinicId = clinicId;
    this.visitDate = visitDate;
    this.notes = notes;
    this.billedAmount = billedAmount;
    this.mediaIds = mediaIds || [];
    this.prescriptionId = prescriptionId;
    this.isDeleted = isDeleted !== undefined ? isDeleted : false;
  }

  setNotes(notes?: string): void {
    this.notes = notes;
  }

  setBilledAmount(amount?: number): void {
    if (amount !== undefined && amount < 0) {
      throw new Error('Billed amount cannot be negative');
    }
    this.billedAmount = amount;
  }

  addMedia(mediaId: string): void {
    if (!this.mediaIds.includes(mediaId)) {
      this.mediaIds.push(mediaId);
    }
  }

  removeMedia(mediaId: string): void {
    this.mediaIds = this.mediaIds.filter((id) => id !== mediaId);
  }

  setPrescription(prescriptionId?: string): void {
    this.prescriptionId = prescriptionId;
  }

  markDeleted(): void {
    this.isDeleted = true;
  }

  restore(): void {
    this.isDeleted = false;
  }
}


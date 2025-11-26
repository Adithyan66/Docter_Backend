import { BaseEntity } from './base.entity';

export interface PrescriptionItem {
  medicineName: string;
  form?: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  notes?: string;
}

export class Prescription extends BaseEntity {
  doctor: string;
  patient: string;
  visit: string;
  clinic?: string;
  diagnosis?: string[];
  items: PrescriptionItem[];
  notes?: string;

  constructor(
    id: string,
    doctor: string,
    patient: string,
    visit: string,
    items: PrescriptionItem[],
    createdAt?: Date,
    updatedAt?: Date,
    clinic?: string,
    diagnosis?: string[],
    notes?: string
  ) {
    super(id, createdAt, updatedAt);
    this.doctor = doctor;
    this.patient = patient;
    this.visit = visit;
    this.clinic = clinic;
    this.diagnosis = diagnosis || [];
    this.items = items || [];
    this.notes = notes;
  }
}


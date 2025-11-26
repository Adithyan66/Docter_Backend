import { BaseEntity } from './base.entity';

export class Prescription extends BaseEntity {
  doctorId: string;
  patientId: string;
  visitId?: string;
  medications: string[];
  instructions?: string;

  constructor(
    id: string,
    doctorId: string,
    patientId: string,
    medications: string[],
    createdAt?: Date,
    updatedAt?: Date,
    visitId?: string,
    instructions?: string
  ) {
    super(id, createdAt, updatedAt);
    this.doctorId = doctorId;
    this.patientId = patientId;
    this.visitId = visitId;
    this.medications = medications;
    this.instructions = instructions;
  }
}


import { BaseEntity } from './base.entity';

export type MediaType = 'image' | 'xray' | 'report' | 'other';

export class Media extends BaseEntity {
  doctorId: string;
  patientId?: string;
  courseId?: string;
  visitId?: string;
  clinicId?: string;
  url: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  type: MediaType;
  notes?: string;
  isDeleted: boolean;

  constructor(
    id: string,
    doctorId: string,
    url: string,
    type: MediaType,
    createdAt?: Date,
    updatedAt?: Date,
    patientId?: string,
    courseId?: string,
    visitId?: string,
    clinicId?: string,
    filename?: string,
    mimeType?: string,
    size?: number,
    notes?: string,
    isDeleted?: boolean
  ) {
    super(id, createdAt, updatedAt);
    this.doctorId = doctorId;
    this.url = url;
    this.type = type;
    this.patientId = patientId;
    this.courseId = courseId;
    this.visitId = visitId;
    this.clinicId = clinicId;
    this.filename = filename;
    this.mimeType = mimeType;
    this.size = size;
    this.notes = notes;
    this.isDeleted = isDeleted !== undefined ? isDeleted : false;
  }

  setNotes(notes?: string): void {
    this.notes = notes;
  }

  markDeleted(): void {
    this.isDeleted = true;
  }

  restore(): void {
    this.isDeleted = false;
  }
}


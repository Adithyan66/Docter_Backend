import { BaseEntity } from './base.entity';
import { Email } from '../value-objects/email.vo';
import { Phone } from '../value-objects/phone.vo';
import { PatientId } from '../value-objects/patient-id.vo';

export type PatientGender = 'male' | 'female' | 'other' | 'unknown';
export type PatientConsultationType = 'one-time' | 'treatment-plan';

export class Patient extends BaseEntity {
  doctorId: string;
  primaryClinic?: string;
  clinics: string[];
  patientId?: PatientId;
  firstName: string;
  lastName?: string;
  fullName: string;
  dob?: Date;
  age?: number;
  gender: PatientGender;
  phone?: Phone;
  email?: Email;
  address?: string;
  profilePicUrl?: string;
  consultationType: PatientConsultationType;
  tags: string[];
  visitCount: number;
  lastVisitAt?: Date;
  isActive: boolean;
  isDeleted: boolean;

  constructor(
    id: string,
    doctorId: string,
    firstName: string,
    consultationType: PatientConsultationType,
    createdAt?: Date,
    updatedAt?: Date,
    primaryClinic?: string,
    clinics?: string[],
    patientId?: PatientId,
    lastName?: string,
    fullName?: string,
    dob?: Date,
    age?: number,
    gender?: PatientGender,
    phone?: Phone,
    email?: Email,
    address?: string,
    profilePicUrl?: string,
    tags?: string[],
    visitCount?: number,
    lastVisitAt?: Date,
    isActive?: boolean,
    isDeleted?: boolean
  ) {
    super(id, createdAt, updatedAt);
    this.doctorId = doctorId;
    this.primaryClinic = primaryClinic;
    this.clinics = clinics || [];
    this.patientId = patientId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.gender = this.ensureGender(gender);
    this.phone = phone;
    this.email = email;
    this.address = address;
    this.profilePicUrl = profilePicUrl;
    this.tags = tags || [];
    this.age = age;
    this.visitCount = visitCount ?? 0;
    this.lastVisitAt = lastVisitAt;
    this.isActive = isActive !== undefined ? isActive : true;
    this.isDeleted = isDeleted !== undefined ? isDeleted : false;
    this.consultationType = this.ensureConsultationType(consultationType);
    this.fullName = this.buildFullName(fullName);
    if (dob) {
      this.setDob(dob);
    }
  }

  updateNames(firstName: string, lastName?: string, fullName?: string): void {
    this.firstName = firstName;
    this.lastName = lastName;
    this.fullName = this.buildFullName(fullName);
  }

  setDob(dob?: Date): void {
    this.dob = dob;
    if (dob) {
      this.age = this.calculateAge(dob);
      return;
    }
    this.age = undefined;
  }

  setConsultationType(type: PatientConsultationType): void {
    this.consultationType = this.ensureConsultationType(type);
  }

  setPatientId(patientId?: PatientId): void {
    this.patientId = patientId;
  }

  setPhone(phone?: Phone): void {
    this.phone = phone;
  }

  setEmail(email?: Email): void {
    this.email = email;
  }

  incrementVisitCount(visitedAt: Date = new Date()): void {
    this.visitCount = (this.visitCount ?? 0) + 1;
    this.lastVisitAt = visitedAt;
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  markDeleted(): void {
    this.isDeleted = true;
    this.isActive = false;
  }

  restore(): void {
    this.isDeleted = false;
    this.isActive = true;
  }

  private buildFullName(fullName?: string): string {
    const computed = `${this.firstName || ''} ${this.lastName || ''}`.trim();
    const value = fullName && fullName.trim().length ? fullName.trim() : computed;
    return value || this.firstName;
  }

  private ensureConsultationType(type: PatientConsultationType): PatientConsultationType {
    if (type !== 'one-time' && type !== 'treatment-plan') {
      throw new Error('Invalid consultation type');
    }
    return type;
  }

  private ensureGender(gender?: PatientGender): PatientGender {
    if (!gender) {
      return 'unknown';
    }
    if (gender !== 'male' && gender !== 'female' && gender !== 'other' && gender !== 'unknown') {
      return 'unknown';
    }
    return gender;
  }

  private calculateAge(dob: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age -= 1;
    }
    return age;
  }
}


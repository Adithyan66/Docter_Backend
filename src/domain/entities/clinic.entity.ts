import { BaseEntity } from './base.entity';
import { Email } from '../value-objects/email.vo';
import { WorkingDay } from '../value-objects/working-day.vo';

export class Clinic extends BaseEntity {
  clinicId: string;
  doctorId: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: Email;
  website?: string;
  locationUrl?: string;
  workingDays?: WorkingDay[];
  treatments?: string[];
  populatedTreatments?: Array<{ id: string; name: string }>;
  images?: string[];
  notes?: string;
  isActive?: boolean;
  isDeleted?: boolean;

  constructor(
    id: string,
    clinicId: string,
    doctorId: string,
    name: string,
    createdAt?: Date,
    updatedAt?: Date,
    address?: string,
    city?: string,
    state?: string,
    pincode?: string,
    phone?: string,
    email?: Email,
    website?: string,
    locationUrl?: string,
    workingDays?: WorkingDay[],
    treatments?: string[],
    populatedTreatments?: Array<{ id: string; name: string }>,
    images?: string[],
    notes?: string,
    isActive?: boolean,
    isDeleted?: boolean
  ) {
    super(id, createdAt, updatedAt);
    this.clinicId = clinicId;
    this.doctorId = doctorId;
    this.name = name;
    this.address = address;
    this.city = city;
    this.state = state;
    this.pincode = pincode;
    this.phone = phone;
    this.email = email;
    this.website = website;
    this.locationUrl = locationUrl;
    this.workingDays = workingDays;
    this.treatments = treatments;
    this.populatedTreatments = populatedTreatments;
    this.images = images;
    this.notes = notes;
    this.isActive = isActive !== undefined ? isActive : true;
    this.isDeleted = isDeleted !== undefined ? isDeleted : false;
  }
}


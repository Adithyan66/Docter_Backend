import { BaseEntity } from './base.entity';

export class Staff extends BaseEntity {
  username: string;
  password: string;
  clinicId: string;
  doctorId: string;
  role: 'staff';
  refreshToken?: string | null;
  isActive: boolean;

  constructor(
    id: string,
    username: string,
    password: string,
    clinicId: string,
    doctorId: string,
    refreshToken?: string | null,
    isActive: boolean = true,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this.username = username;
    this.password = password;
    this.clinicId = clinicId;
    this.doctorId = doctorId;
    this.role = 'staff';
    this.refreshToken = refreshToken;
    this.isActive = isActive;
  }
}



import { BaseEntity } from './base.entity';
import { Email } from '../value-objects/email.vo';

export class Doctor extends BaseEntity {
  email: Email;
  password: string;
  refreshToken?: string;

  constructor(id: string, email: Email, password: string, createdAt?: Date, updatedAt?: Date, refreshToken?: string) {
    super(id, createdAt, updatedAt);
    this.email = email;
    this.password = password;
    this.refreshToken = refreshToken;
  }
}

 
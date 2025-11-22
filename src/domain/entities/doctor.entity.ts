import { BaseEntity } from './base.entity';
import { Email } from '../value-objects/email.vo';

export class Doctor extends BaseEntity {
  email: Email;
  password: string;

  constructor(id: string, email: Email, password: string, createdAt?: Date, updatedAt?: Date) {
    super(id, createdAt, updatedAt);
    this.email = email;
    this.password = password;
  }
}

 
import { BaseEntity } from './base.entity';

export class Media extends BaseEntity {
  url: string;
  type: string;
  size?: number;

  constructor(id: string, url: string, type: string, createdAt?: Date, updatedAt?: Date, size?: number) {
    super(id, createdAt, updatedAt);
    this.url = url;
    this.type = type;
    this.size = size;
  }
}


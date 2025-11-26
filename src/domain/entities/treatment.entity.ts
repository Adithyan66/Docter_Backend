import { BaseEntity } from './base.entity';

export class Treatment extends BaseEntity {
  doctorId: string;
  name: string;
  description?: string;
  minDuration?: number;
  maxDuration?: number;
  avgDuration?: number;
  minFees?: number;
  maxFees?: number;
  avgFees?: number;
  steps?: string[];
  aftercare?: string[];
  followUpRequired?: boolean;
  followUpAfterDays?: number;
  risks?: string[];
  images?: string[];
  isDeleted?: boolean;

  constructor(
    id: string,
    doctorId: string,
    name: string,
    createdAt?: Date,
    updatedAt?: Date,
    description?: string,
    minDuration?: number,
    maxDuration?: number,
    avgDuration?: number,
    minFees?: number,
    maxFees?: number,
    avgFees?: number,
    steps?: string[],
    aftercare?: string[],
    followUpRequired?: boolean,
    followUpAfterDays?: number,
    risks?: string[],
    images?: string[],
    isDeleted?: boolean
  ) {
    super(id, createdAt, updatedAt);
    this.doctorId = doctorId;
    this.name = name;
    this.description = description;
    this.minDuration = minDuration;
    this.maxDuration = maxDuration;
    this.avgDuration = avgDuration;
    this.minFees = minFees;
    this.maxFees = maxFees;
    this.avgFees = avgFees;
    this.steps = steps;
    this.aftercare = aftercare;
    this.followUpRequired = followUpRequired;
    this.followUpAfterDays = followUpAfterDays;
    this.risks = risks;
    this.images = images;
    this.isDeleted = isDeleted || false;
  }
}


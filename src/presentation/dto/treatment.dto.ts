export interface CreateTreatmentRequestDto {
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
}

export interface UpdateTreatmentRequestDto {
  name?: string;
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
}

export interface TreatmentResponseDto {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface TreatmentList {
  id: string;
  name: string;
  avgFees?: number;
  avgDuration?: number;
  numberOfPatients: number;
  ongoing: number;
  completed: number;
}

export interface PaginatedTreatmentsResponseDto {
  treatments: TreatmentList[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


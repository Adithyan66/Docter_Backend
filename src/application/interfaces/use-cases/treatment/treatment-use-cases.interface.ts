import { VisitIntervalUnit } from '../../../../domain/value-objects/visit-interval-unit.vo';
import { Treatment } from '../../../../domain/entities/treatment.entity';
import {
  CreateTreatmentRequestDto,
  UpdateTreatmentRequestDto,
  TreatmentResponseDto,
  PaginatedTreatmentsResponseDto,
  TreatmentList,
} from '../../../../presentation/dto/treatment.dto';

export {
  CreateTreatmentRequestDto,
  UpdateTreatmentRequestDto,
  TreatmentResponseDto,
  PaginatedTreatmentsResponseDto,
  TreatmentList,
};

export interface GetTreatmentOptions {
  includeStatistics?: boolean;
  startDateFrom?: Date;
  startDateTo?: Date;
  clinicId?: string;
  include?: string[];
  exclude?: string[];
}

export interface GetTreatmentResult {
  treatment: Treatment;
  statistics?: any;
}

export interface ICreateTreatmentUseCase {
  execute(doctorId: string, input: CreateTreatmentRequestDto): Promise<void>;
}

export interface IUpdateTreatmentUseCase {
  execute(id: string, doctorId: string, input: UpdateTreatmentRequestDto): Promise<void>;
}

export interface IDeleteTreatmentUseCase {
  execute(id: string, doctorId: string): Promise<void>;
}

export interface IGetTreatmentUseCase {
  execute(id: string, doctorId: string, options?: GetTreatmentOptions): Promise<GetTreatmentResult>;
}

export interface IGetAllTreatmentsUseCase {
  execute(
    doctorId: string,
    page?: number,
    limit?: number,
    sortBy?: 'averageAmount' | 'averageDuration' | 'numberOfPatients' | 'ongoing' | 'completed' | '',
    sortOrder?: 'asc' | 'desc',
    search?: string
  ): Promise<{ treatments: TreatmentList[]; total: number; page: number; limit: number; totalPages: number }>;
}

export interface IGetTreatmentNamesUseCase {
  execute(doctorId: string, search?: string): Promise<Array<{ id: string; name: string }>>;
}

export interface IGetTreatmentImagesUseCase {
  execute(
    treatmentId: string,
    doctorId: string,
    options: { page?: number; limit?: number }
  ): Promise<{ images: string[]; total: number; page: number; limit: number; totalPages: number }>;
}

export interface IAddTreatmentImagesUseCase {
  execute(treatmentId: string, doctorId: string, imageUrls: string[]): Promise<void>;
}

export interface IDeleteTreatmentImageUseCase {
  execute(
    treatmentId: string,
    imageIndex: number,
    imageUrl: string,
    requester: { doctorId: string; role: 'doctor' | 'staff'; clinicId?: string }
  ): Promise<boolean>;
}

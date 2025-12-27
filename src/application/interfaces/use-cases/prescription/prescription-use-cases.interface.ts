import {
  CreatePrescriptionRequestDto,
  UpdatePrescriptionRequestDto,
  PrescriptionResponseDto,
  GetPrescriptionsQueryDto,
  PaginatedPrescriptionsResponseDto,
} from '../../../../presentation/dto/prescription.dto';

export {
  CreatePrescriptionRequestDto,
  UpdatePrescriptionRequestDto,
  PrescriptionResponseDto,
  GetPrescriptionsQueryDto,
  PaginatedPrescriptionsResponseDto,
};

export interface ICreatePrescriptionUseCase {
  execute(doctorId: string, input: CreatePrescriptionRequestDto): Promise<PrescriptionResponseDto>;
}

export interface IGetPrescriptionUseCase {
  execute(id: string, doctorId: string): Promise<PrescriptionResponseDto>;
}

export interface IGetAllPrescriptionsUseCase {
  execute(doctorId: string, query: GetPrescriptionsQueryDto): Promise<PaginatedPrescriptionsResponseDto>;
}

export interface IUpdatePrescriptionUseCase {
  execute(id: string, doctorId: string, input: UpdatePrescriptionRequestDto): Promise<PrescriptionResponseDto>;
}

export interface IDeletePrescriptionUseCase {
  execute(id: string, doctorId: string): Promise<void>;
}

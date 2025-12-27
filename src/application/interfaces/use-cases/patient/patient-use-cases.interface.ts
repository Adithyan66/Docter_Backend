import {
  CreatePatientRequestDto,
  UpdatePatientRequestDto,
  PatientResponseDto,
  PatientDetailResponseDto,
  GetPatientsQueryDto,
  PaginatedPatientsResponseDto,
} from '../../../../presentation/dto/patient.dto';

export {
  CreatePatientRequestDto,
  UpdatePatientRequestDto,
  PatientResponseDto,
  PatientDetailResponseDto,
  GetPatientsQueryDto,
  PaginatedPatientsResponseDto,
};

export interface ICreatePatientUseCase {
  execute(doctorId: string, input: CreatePatientRequestDto): Promise<PatientResponseDto>;
}

export interface IUpdatePatientUseCase {
  execute(id: string, doctorId: string, input: UpdatePatientRequestDto): Promise<PatientResponseDto>;
}

export interface IDeletePatientUseCase {
  execute(id: string, doctorId: string): Promise<void>;
}

export interface IRestorePatientUseCase {
  execute(id: string, doctorId: string): Promise<void>;
}

export interface IGetPatientUseCase {
  execute(id: string, doctorId: string): Promise<PatientResponseDto>;
  executeDetail(id: string, doctorId: string): Promise<PatientDetailResponseDto>;
}

export interface IGetPatientsUseCase {
  execute(doctorId: string, input: GetPatientsQueryDto): Promise<PaginatedPatientsResponseDto>;
}

import {
  CreateStaffRequestDto,
  UpdateStaffRequestDto,
  StaffResponseDto,
  PaginatedStaffResponseDto,
} from '../../../../presentation/dto/staff.dto';

export {
  CreateStaffRequestDto,
  UpdateStaffRequestDto,
  StaffResponseDto,
  PaginatedStaffResponseDto,
};

export type GetAllStaffParams = {
  page?: number;
  limit?: number;
  username?: string;
  clinicId?: string;
  isActive?: boolean;
};

export interface ICreateStaffUseCase {
  execute(doctorId: string, input: CreateStaffRequestDto): Promise<StaffResponseDto>;
}

export interface IUpdateStaffUseCase {
  execute(id: string, doctorId: string, input: UpdateStaffRequestDto): Promise<StaffResponseDto>;
}

export interface IDeleteStaffUseCase {
  execute(id: string, doctorId: string): Promise<void>;
}

export interface IGetStaffUseCase {
  execute(id: string, doctorId: string): Promise<StaffResponseDto>;
}

export interface IGetAllStaffUseCase {
  execute(doctorId: string, params?: GetAllStaffParams): Promise<PaginatedStaffResponseDto>;
}

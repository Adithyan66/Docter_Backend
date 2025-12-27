import {
  CreateVisitRequestDto,
  UpdateVisitRequestDto,
  VisitResponseDto,
  GetVisitsQueryDto,
  PaginatedVisitsResponseDto,
} from '../../../../presentation/dto/visit.dto';
import {
  GetVisitRemindersQueryDto,
  PaginatedVisitRemindersResponseDto,
} from '../../../../presentation/dto/visit-reminder.dto';

export {
  CreateVisitRequestDto,
  UpdateVisitRequestDto,
  VisitResponseDto,
  GetVisitsQueryDto,
  PaginatedVisitsResponseDto,
  GetVisitRemindersQueryDto,
  PaginatedVisitRemindersResponseDto,
};

export interface ICreateVisitUseCase {
  execute(doctorId: string, input: CreateVisitRequestDto): Promise<VisitResponseDto>;
}

export interface IUpdateVisitUseCase {
  execute(id: string, doctorId: string, input: UpdateVisitRequestDto): Promise<VisitResponseDto>;
}

export interface IDeleteVisitUseCase {
  execute(id: string, doctorId: string): Promise<void>;
}

export interface IGetVisitUseCase {
  execute(id: string, doctorId: string): Promise<VisitResponseDto>;
}

export interface IGetAllVisitsUseCase {
  execute(doctorId: string, query: GetVisitsQueryDto): Promise<PaginatedVisitsResponseDto>;
}

export interface IGetVisitRemindersUseCase {
  execute(doctorId: string, input: GetVisitRemindersQueryDto): Promise<PaginatedVisitRemindersResponseDto>;
}

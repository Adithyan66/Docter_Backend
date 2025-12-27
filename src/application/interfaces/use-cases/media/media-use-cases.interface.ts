import { CreateMediaRequestDto, UpdateMediaRequestDto, MediaResponseDto, GetMediaQueryDto, PaginatedMediaResponseDto } from '../../../../presentation/dto/media.dto';

export { CreateMediaRequestDto, UpdateMediaRequestDto, MediaResponseDto, GetMediaQueryDto, PaginatedMediaResponseDto };

export interface ICreateMediaUseCase {
  execute(doctorId: string, input: CreateMediaRequestDto): Promise<MediaResponseDto>;
}

export interface IUpdateMediaUseCase {
  execute(id: string, doctorId: string, input: UpdateMediaRequestDto): Promise<MediaResponseDto>;
}

export interface IDeleteMediaUseCase {
  execute(id: string, doctorId: string): Promise<void>;
}

export interface IGetMediaUseCase {
  execute(id: string, doctorId: string): Promise<MediaResponseDto>;
}

export interface IGetAllMediaUseCase {
  execute(doctorId: string, query: GetMediaQueryDto): Promise<PaginatedMediaResponseDto>;
}

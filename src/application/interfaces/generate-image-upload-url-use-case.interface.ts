import { GenerateUploadUrlDto, UploadUrlResponseDto } from '../../presentation/dto/image-upload.dto';

export interface IGenerateImageUploadUrlUseCase {
  execute(type: string, dto: GenerateUploadUrlDto): Promise<UploadUrlResponseDto>;
}


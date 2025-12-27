import { GenerateUploadUrlDto, UploadUrlResponseDto } from '../../../../presentation/dto/image-upload.dto';

export { GenerateUploadUrlDto, UploadUrlResponseDto };

export interface DownloadUrlResponseDto {
  downloadUrl: string;
  expiresIn: number;
}

export interface IGenerateImageUploadUrlUseCase {
  execute(type: string, dto: GenerateUploadUrlDto): Promise<UploadUrlResponseDto>;
}

export interface IGenerateImageDownloadUrlUseCase {
  execute(imageUrl: string): Promise<DownloadUrlResponseDto>;
}

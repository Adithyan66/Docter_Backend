import { injectable, inject } from 'tsyringe';
import { IFileStorageService } from '../../interfaces/file-storage-service.interface';
import { ValidationError } from '../../../domain/errors/validation.error';
import { IGenerateImageDownloadUrlUseCase, DownloadUrlResponseDto } from '../../interfaces/use-cases/image/image-use-cases.interface';

export { DownloadUrlResponseDto };

@injectable()
export class GenerateImageDownloadUrlUseCase implements IGenerateImageDownloadUrlUseCase {
  constructor(
    @inject('IFileStorageService') private fileStorageService: IFileStorageService
  ) {}

  async execute(imageUrl: string): Promise<DownloadUrlResponseDto> {
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
      throw new ValidationError('Image URL is required');
    }

    try {
      const key = this.fileStorageService.extractKeyFromUrl(imageUrl);
      if (!key || key.trim().length === 0) {
        throw new ValidationError('Invalid image URL format');
      }

      const downloadUrl = await this.fileStorageService.generateDownloadUrl(key);
      
      return {
        downloadUrl,
        expiresIn: 300,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Invalid image URL or unable to generate download URL');
    }
  }
}

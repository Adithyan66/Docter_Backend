import { injectable, inject } from 'tsyringe';
import { IS3Service } from '../../interfaces/s3-service.interface';
import { ValidationError } from '../../../domain/errors/validation.error';
import { IGenerateImageDownloadUrlUseCase, DownloadUrlResponseDto } from '../../interfaces/use-cases/image/image-use-cases.interface';

export { DownloadUrlResponseDto };

@injectable()
export class GenerateImageDownloadUrlUseCase implements IGenerateImageDownloadUrlUseCase {
  constructor(
    @inject('IS3Service') private s3Service: IS3Service
  ) {}

  async execute(imageUrl: string): Promise<DownloadUrlResponseDto> {
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
      throw new ValidationError('Image URL is required');
    }

    try {
      const key = this.s3Service.extractS3KeyFromUrl(imageUrl);
      if (!key || key.trim().length === 0) {
        throw new ValidationError('Invalid image URL format');
      }

      const downloadUrl = await this.s3Service.generateDownloadPresignedUrl(key);
      
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

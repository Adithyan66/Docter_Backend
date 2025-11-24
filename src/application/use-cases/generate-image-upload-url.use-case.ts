import { injectable, inject } from 'tsyringe';
import { IImageUploadService } from '../interfaces/image-upload-service.interface';
import { IGenerateImageUploadUrlUseCase } from '../interfaces/generate-image-upload-url-use-case.interface';
import { GenerateUploadUrlDto, UploadUrlResponseDto } from '../../presentation/dto/image-upload.dto';
import { ValidationError } from '../../domain/errors/validation.error';
import { config } from '../../infrastructure/config';

@injectable()
export class GenerateImageUploadUrlUseCase implements IGenerateImageUploadUrlUseCase {
  constructor(
    @inject('IImageUploadService') private imageUploadService: IImageUploadService
  ) {}

  async execute(type: string, dto: GenerateUploadUrlDto): Promise<UploadUrlResponseDto> {

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    
    if (!allowedExtensions.includes(dto.fileExtension.toLowerCase())) {
      throw new ValidationError('Invalid file extension. Allowed: jpg, jpeg, png, webp');
    }

    const allowedTypes = config.allowedImageTypes;

    if (!allowedTypes.includes(type)) {
      throw new ValidationError(`Invalid image type. Allowed: ${allowedTypes.join(', ')}`);
    }

    return await this.imageUploadService.generateUploadUrl(type, dto.fileExtension);
  }
}


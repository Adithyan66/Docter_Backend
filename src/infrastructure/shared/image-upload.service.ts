import { injectable, inject } from 'tsyringe';
import { IS3Service } from '../../application/interfaces/s3-service.interface';
import { IImageUploadService } from '../../application/interfaces/image-upload-service.interface';

@injectable()
export class ImageUploadService implements IImageUploadService {
  constructor(
    @inject('IS3Service') private s3Service: IS3Service
  ) {}

  async generateUploadUrl(type: string, fileExtension: string): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const key = `${type}/${timestamp}-${random}.${fileExtension}`;
    
    const contentType = this.getContentType(fileExtension);
    const uploadUrl = await this.s3Service.generatePresignedUrl(key, contentType);
    const publicUrl = this.s3Service.getPublicUrl(key);

    return {
      uploadUrl,
      publicUrl,
      key
    };
  }

  private getContentType(fileExtension: string): string {
    const extension = fileExtension.toLowerCase();
    const contentTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp'
    };
    return contentTypes[extension] || 'application/octet-stream';
  }
}


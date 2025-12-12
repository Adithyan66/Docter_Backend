import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { IGenerateImageUploadUrlUseCase } from '../../application/interfaces/generate-image-upload-url-use-case.interface';
import { GenerateImageDownloadUrlUseCase } from '../../application/use-cases/image/generate-image-download-url.use-case';
import { BadRequestError } from '../../domain/errors/bad-request.error';

@injectable()
export class ImageServiceController {
  constructor(
    @inject('IGenerateImageUploadUrlUseCase') private generateUploadUrlUseCase: IGenerateImageUploadUrlUseCase,
    @inject('GenerateImageDownloadUrlUseCase') private generateDownloadUrlUseCase: GenerateImageDownloadUrlUseCase
  ) {}

  generateUploadUrl = async (req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> => {
    
    const { type } = req.params;

    if (!type) {
      throw new BadRequestError('Type is required');
    }

    const { fileExtension } = req.body as { fileExtension?: string };

    if (!fileExtension) {
      throw new BadRequestError('File extension is required');
    }

    const result = await this.generateUploadUrlUseCase.execute(type, { fileExtension });

    successResponse(res, result, HttpStatus.OK, 'Upload URL generated successfully');
  };

  generateDownloadUrl = async (req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> => {
    const imageUrl = req.query.url as string;

    if (!imageUrl) {
      throw new BadRequestError('Image URL is required as query parameter');
    }

    const result = await this.generateDownloadUrlUseCase.execute(imageUrl);

    successResponse(res, result, HttpStatus.OK, 'Download URL generated successfully');
  };
}


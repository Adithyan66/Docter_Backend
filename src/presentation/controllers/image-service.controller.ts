import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { IImageServiceController } from '../interfaces/controllers/image-service-controller.interface';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { IGenerateImageUploadUrlUseCase, IGenerateImageDownloadUrlUseCase } from '../../application/interfaces/use-cases/image/image-use-cases.interface';
import { BadRequestError } from '../../domain/errors/bad-request.error';

@injectable()
export class ImageServiceController implements IImageServiceController {
  constructor(
    @inject('IGenerateImageUploadUrlUseCase') private generateUploadUrlUseCase: IGenerateImageUploadUrlUseCase,
    @inject('IGenerateImageDownloadUrlUseCase') private generateDownloadUrlUseCase: IGenerateImageDownloadUrlUseCase
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


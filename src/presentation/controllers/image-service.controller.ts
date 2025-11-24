import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { IGenerateImageUploadUrlUseCase } from '../../application/interfaces/generate-image-upload-url-use-case.interface';
import { BadRequestError } from '../../domain/errors/bad-request.error';

@injectable()
export class ImageServiceController {
  constructor(
    @inject('IGenerateImageUploadUrlUseCase') private generateUploadUrlUseCase: IGenerateImageUploadUrlUseCase
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
}


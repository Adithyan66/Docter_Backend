import { injectable, inject } from 'tsyringe';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { IFileStorageService } from '../../interfaces/file-storage-service.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error';
import { ValidationError } from '../../../domain/errors/validation.error';
import { AuthenticationErrors } from '../../../infrastructure/constants/error-messages';
import { IDeleteTreatmentImageUseCase } from '../../interfaces/use-cases/treatment/treatment-use-cases.interface';
import { normalizeUrl } from '../../../presentation/utils/url.util';

@injectable()
export class DeleteTreatmentImageUseCase implements IDeleteTreatmentImageUseCase {
  constructor(
    @inject('ITreatmentRepository') private treatmentRepository: ITreatmentRepository,
    @inject('IFileStorageService') private fileStorageService: IFileStorageService
  ) {}

  async execute(
    treatmentId: string,
    imageIndex: number,
    imageUrl: string,
    requester: { doctorId: string; role: 'doctor' | 'staff'; clinicId?: string }
  ): Promise<boolean> {
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
      throw new ValidationError('Image URL is required');
    }

    const { doctorId, role } = requester;

    const treatment = await this.treatmentRepository.findById(treatmentId);
    if (!treatment || treatment.doctorId !== doctorId) {
      throw new NotFoundError('Treatment', treatmentId);
    }

    if (role === 'staff') {
      throw new UnauthorizedError(AuthenticationErrors.UNAUTHORIZED);
    }

    const imagesResult = await this.treatmentRepository.getTreatmentImages(treatmentId, {
      page: 1,
      limit: imageIndex + 1,
    });

    if (!imagesResult.images || imagesResult.images.length === 0) {
      throw new NotFoundError('Image', imageIndex.toString());
    }

    if (imageIndex < 0 || imageIndex >= imagesResult.images.length) {
      throw new NotFoundError('Image', imageIndex.toString());
    }

    const storedImageUrl = imagesResult.images[imageIndex];
    const normalizedStoredUrl = normalizeUrl(storedImageUrl);
    const normalizedProvidedUrl = normalizeUrl(imageUrl);

    if (normalizedStoredUrl !== normalizedProvidedUrl) {
      throw new ValidationError('Image URL does not match the image at the specified index');
    }

    const fileKey = this.fileStorageService.extractKeyFromUrl(storedImageUrl);

    try {
      await this.fileStorageService.deleteFile(fileKey);
    } catch (error) {
      throw new Error(`Failed to delete image from cloud storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const deleted = await this.treatmentRepository.deleteTreatmentImage(treatmentId, imageIndex);
    if (!deleted) {
      throw new NotFoundError('Image', imageIndex.toString());
    }

    return true;
  }
}


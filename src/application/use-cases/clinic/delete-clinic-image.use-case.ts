import { injectable, inject } from 'tsyringe';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { IFileStorageService } from '../../interfaces/file-storage-service.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error';
import { ValidationError } from '../../../domain/errors/validation.error';
import { AuthenticationErrors } from '../../../infrastructure/constants/error-messages';
import { IDeleteClinicImageUseCase } from '../../interfaces/use-cases/clinic/clinic-use-cases.interface';
import { normalizeUrl } from '../../../presentation/utils/url.util';

@injectable()
export class DeleteClinicImageUseCase implements IDeleteClinicImageUseCase {
  constructor(
    @inject('IClinicRepository') private clinicRepository: IClinicRepository,
    @inject('IFileStorageService') private fileStorageService: IFileStorageService
  ) {}

  async execute(
    clinicId: string,
    imageIndex: number,
    imageUrl: string,
    requester: { doctorId: string; role: 'doctor' | 'staff'; clinicId?: string }
  ): Promise<boolean> {
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
      throw new ValidationError('Image URL is required');
    }

    const { doctorId, role, clinicId: staffClinicId } = requester;

    const clinic = await this.clinicRepository.findById(clinicId);
    if (!clinic || clinic.doctorId !== doctorId) {
      throw new NotFoundError('Clinic', clinicId);
    }

    if (role === 'staff') {
      if (!staffClinicId || staffClinicId !== clinic.id) {
        throw new UnauthorizedError(AuthenticationErrors.UNAUTHORIZED);
      }
    }

    if (!clinic.images || clinic.images.length === 0) {
      throw new NotFoundError('Image', imageIndex.toString());
    }

    if (imageIndex < 0 || imageIndex >= clinic.images.length) {
      throw new NotFoundError('Image', imageIndex.toString());
    }

    const storedImageUrl = clinic.images[imageIndex];
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

    const deleted = await this.clinicRepository.deleteClinicImage(clinicId, imageIndex);
    if (!deleted) {
      throw new NotFoundError('Image', imageIndex.toString());
    }

    return true;
  }


}

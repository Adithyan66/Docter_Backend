import { injectable, inject } from 'tsyringe';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { IFileStorageService } from '../../interfaces/file-storage-service.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error';
import { AuthenticationErrors } from '../../../infrastructure/constants/error-messages';
import { IDeleteClinicImageUseCase } from '../../interfaces/use-cases/clinic/clinic-use-cases.interface';

@injectable()
export class DeleteClinicImageUseCase implements IDeleteClinicImageUseCase {
  constructor(
    @inject('IClinicRepository') private clinicRepository: IClinicRepository,
    @inject('IFileStorageService') private fileStorageService: IFileStorageService
  ) {}

  async execute(
    clinicId: string,
    imageIndex: number,
    requester: { doctorId: string; role: 'doctor' | 'staff'; clinicId?: string }
  ): Promise<boolean> {
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

    const imageUrl = clinic.images[imageIndex];
    const fileKey = this.fileStorageService.extractKeyFromUrl(imageUrl);

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

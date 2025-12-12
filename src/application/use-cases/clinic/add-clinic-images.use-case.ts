import { injectable, inject } from 'tsyringe';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { ValidationError } from '../../../domain/errors/validation.error';

@injectable()
export class AddClinicImagesUseCase {
  constructor(
    @inject('IClinicRepository') private clinicRepository: IClinicRepository
  ) {}

  async execute(
    clinicId: string,
    doctorId: string,
    imageUrls: string[]
  ): Promise<void> {
    if (!imageUrls || imageUrls.length === 0) {
      throw new ValidationError('At least one image URL is required');
    }

    const clinic = await this.clinicRepository.findById(clinicId);
    if (!clinic || clinic.doctorId !== doctorId) {
      throw new NotFoundError('Clinic', clinicId);
    }

    for (const url of imageUrls) {
      if (!url || typeof url !== 'string' || url.trim().length === 0) {
        throw new ValidationError('All image URLs must be valid non-empty strings');
      }
    }

    const added = await this.clinicRepository.addClinicImages(clinicId, imageUrls);
    if (!added) {
      throw new NotFoundError('Clinic', clinicId);
    }
  }
}

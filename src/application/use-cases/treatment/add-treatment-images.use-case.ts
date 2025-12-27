import { injectable, inject } from 'tsyringe';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { ValidationError } from '../../../domain/errors/validation.error';
import { IAddTreatmentImagesUseCase } from '../../interfaces/use-cases/treatment/treatment-use-cases.interface';

@injectable()
export class AddTreatmentImagesUseCase implements IAddTreatmentImagesUseCase {
  constructor(
    @inject('ITreatmentRepository') private treatmentRepository: ITreatmentRepository
  ) {}

  async execute(
    treatmentId: string,
    doctorId: string,
    imageUrls: string[]
  ): Promise<void> {
    if (!imageUrls || imageUrls.length === 0) {
      throw new ValidationError('At least one image URL is required');
    }

    const treatment = await this.treatmentRepository.findById(treatmentId);
    if (!treatment || treatment.doctorId !== doctorId) {
      throw new NotFoundError('Treatment', treatmentId);
    }

    for (const url of imageUrls) {
      if (!url || typeof url !== 'string' || url.trim().length === 0) {
        throw new ValidationError('All image URLs must be valid non-empty strings');
      }
    }

    const added = await this.treatmentRepository.addTreatmentImages(treatmentId, imageUrls);
    if (!added) {
      throw new NotFoundError('Treatment', treatmentId);
    }
  }
}

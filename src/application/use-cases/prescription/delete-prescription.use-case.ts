import { injectable, inject } from 'tsyringe';
import { IPrescriptionRepository } from '../../../domain/repositories/prescription.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';

@injectable()
export class DeletePrescriptionUseCase {
  constructor(
    @inject('IPrescriptionRepository') private readonly prescriptionRepository: IPrescriptionRepository
  ) {}

  async execute(id: string, doctorId: string): Promise<void> {
    const prescription = await this.prescriptionRepository.findByIdAndDoctor(id, doctorId);
    if (!prescription) {
      throw new NotFoundError('Prescription', id);
    }

    const deleted = await this.prescriptionRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Prescription', id);
    }
  }
}


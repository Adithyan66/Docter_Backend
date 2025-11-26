import { injectable, inject } from 'tsyringe';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';

@injectable()
export class DeleteTreatmentUseCase {
  constructor(
    @inject('ITreatmentRepository') private treatmentRepository: ITreatmentRepository
  ) {}

  async execute(id: string, doctorId: string): Promise<void> {
    const treatment = await this.treatmentRepository.findById(id);
    if (!treatment || treatment.doctorId !== doctorId) {
      throw new NotFoundError('Treatment', id);
    }

    const deleted = await this.treatmentRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Treatment', id);
    }
  }
}


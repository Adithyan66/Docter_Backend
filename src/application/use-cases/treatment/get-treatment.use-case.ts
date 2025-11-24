import { injectable, inject } from 'tsyringe';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { Treatment } from '../../../domain/entities/treatment.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

@injectable()
export class GetTreatmentUseCase {
  constructor(
    @inject('ITreatmentRepository') private treatmentRepository: ITreatmentRepository
  ) {}

  async execute(id: string): Promise<Treatment> {
    const treatment = await this.treatmentRepository.findById(id);
    if (!treatment) {
      throw new NotFoundError('Treatment', id);
    }
    return treatment;
  }
}


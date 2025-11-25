import { injectable, inject } from 'tsyringe';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';

@injectable()
export class GetTreatmentNamesUseCase {
  constructor(
    @inject('ITreatmentRepository') private readonly treatmentRepository: ITreatmentRepository
  ) {}

  async execute(search?: string): Promise<Array<{ id: string; name: string }>> {
    return this.treatmentRepository.findNames(search?.trim());
  }
}



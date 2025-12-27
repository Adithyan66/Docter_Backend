import { injectable, inject } from 'tsyringe';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { IGetTreatmentNamesUseCase } from '../../interfaces/use-cases/treatment/treatment-use-cases.interface';

@injectable()
export class GetTreatmentNamesUseCase implements IGetTreatmentNamesUseCase {
  constructor(
    @inject('ITreatmentRepository') private readonly treatmentRepository: ITreatmentRepository
  ) {}

  async execute(doctorId: string, search?: string): Promise<Array<{ id: string; name: string }>> {
    return this.treatmentRepository.findNames(doctorId, search?.trim());
  }
}



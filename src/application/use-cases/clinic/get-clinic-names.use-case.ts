import { injectable, inject } from 'tsyringe';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';

@injectable()
export class GetClinicNamesUseCase {
  constructor(
    @inject('IClinicRepository') private readonly clinicRepository: IClinicRepository
  ) {}

  async execute(doctorId: string, search?: string): Promise<Array<{ id: string; name: string }>> {
    return this.clinicRepository.findNames(doctorId, search?.trim());
  }
}


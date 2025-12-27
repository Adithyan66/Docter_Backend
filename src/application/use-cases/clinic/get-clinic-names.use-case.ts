import { injectable, inject } from 'tsyringe';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { IGetClinicNamesUseCase } from '../../interfaces/use-cases/clinic/clinic-use-cases.interface';

@injectable()
export class GetClinicNamesUseCase implements IGetClinicNamesUseCase {
  constructor(
    @inject('IClinicRepository') private readonly clinicRepository: IClinicRepository
  ) {}

  async execute(doctorId: string, search?: string): Promise<Array<{ id: string; name: string }>> {
    return this.clinicRepository.findNames(doctorId, search?.trim());
  }
}


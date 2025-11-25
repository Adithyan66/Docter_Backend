import { injectable, inject } from 'tsyringe';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { Clinic } from '../../../domain/entities/clinic.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

@injectable()
export class GetClinicUseCase {
  constructor(
    @inject('IClinicRepository') private clinicRepository: IClinicRepository
  ) {}

  async execute(id: string): Promise<Clinic> {
    const clinic = await this.clinicRepository.findById(id);
    if (!clinic) {
      throw new NotFoundError('Clinic', id);
    }
    return clinic;
  }
}


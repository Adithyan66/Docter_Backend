import { injectable, inject } from 'tsyringe';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { IDeleteClinicUseCase } from '../../interfaces/use-cases/clinic/clinic-use-cases.interface';

@injectable()
export class DeleteClinicUseCase implements IDeleteClinicUseCase {
  constructor(
    @inject('IClinicRepository') private clinicRepository: IClinicRepository
  ) {}

  async execute(id: string, doctorId: string): Promise<void> {
    const clinic = await this.clinicRepository.findById(id);
    if (!clinic || clinic.doctorId !== doctorId) {
      throw new NotFoundError('Clinic', id);
    }

    const updated = await this.clinicRepository.update(id, { isDeleted: true });
    if (!updated) {
      throw new NotFoundError('Clinic', id);
    }
  }
}


import { injectable, inject } from 'tsyringe';
import { IClinicRepository, FindAllPaginatedOptions } from '../../../domain/repositories/clinic.repository';

@injectable()
export class GetAllClinicsUseCase {
  constructor(
    @inject('IClinicRepository') private clinicRepository: IClinicRepository
  ) {}

  async execute(
    doctorId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ clinics: any[]; total: number; page: number; limit: number; totalPages: number }> {
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const options: FindAllPaginatedOptions = {
      page,
      limit,
      search: search?.trim() || undefined,
      doctorId,
    };

    return await this.clinicRepository.findAllPaginated(options);
  }
}


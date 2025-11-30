import { injectable, inject } from 'tsyringe';
import { IClinicRepository, FindAllPaginatedOptions } from '../../../domain/repositories/clinic.repository';

export type GetClinicsParams = {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'numOfPatients' | 'onGoingTreatments' | 'completedTreatments';
  sortOrder?: 'asc' | 'desc';
  search?: string;
};

@injectable()
export class GetAllClinicsUseCase {
  constructor(
    @inject('IClinicRepository') private clinicRepository: IClinicRepository
  ) {}

  async execute(
    doctorId: string,
    params: GetClinicsParams = {}
  ): Promise<{ clinics: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = params.page && params.page >= 1 ? params.page : 1;
    const limit = params.limit && params.limit >= 1 && params.limit <= 100 ? params.limit : 10;
    const search = params.search?.trim() || undefined;
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const options: FindAllPaginatedOptions = {
      page,
      limit,
      search,
      doctorId,
      sortBy,
      sortOrder,
    };

    return await this.clinicRepository.findAllPaginated(options);
  }
}


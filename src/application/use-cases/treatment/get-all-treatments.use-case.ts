import { injectable, inject } from 'tsyringe';
import { ITreatmentRepository, FindAllPaginatedOptions } from '../../../domain/repositories/treatment.repository';

@injectable()
export class GetAllTreatmentsUseCase {
  constructor(
    @inject('ITreatmentRepository') private treatmentRepository: ITreatmentRepository
  ) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    sortBy?: 'fees' | 'duration' | 'createdAt',
    sortOrder?: 'asc' | 'desc',
    search?: string
  ): Promise<{ treatments: any[]; total: number; page: number; limit: number; totalPages: number }> {
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const options: FindAllPaginatedOptions = {
      page,
      limit,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
      search: search?.trim() || undefined,
    };

    return await this.treatmentRepository.findAllPaginated(options);
  }
}


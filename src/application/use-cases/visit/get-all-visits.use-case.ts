import { injectable, inject } from 'tsyringe';
import { IVisitRepository } from '../../../domain/repositories/visit.repository';
import { GetVisitsQueryDto, PaginatedVisitsResponseDto } from '../../../presentation/dto/visit.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { visitToDto } from '../../mappers/visit.mapper';

@injectable()
export class GetAllVisitsUseCase {
  constructor(@inject('IVisitRepository') private readonly visitRepository: IVisitRepository) {}

  async execute(doctorId: string, query: GetVisitsQueryDto): Promise<PaginatedVisitsResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const visitDateFrom = query.visitDateFrom ? new Date(query.visitDateFrom) : undefined;
    const visitDateTo = query.visitDateTo ? new Date(query.visitDateTo) : undefined;

    if (visitDateFrom && isNaN(visitDateFrom.getTime())) {
      throw new ValidationError('Invalid visitDateFrom format');
    }
    if (visitDateTo && isNaN(visitDateTo.getTime())) {
      throw new ValidationError('Invalid visitDateTo format');
    }

    const result = await this.visitRepository.findPaginated({
      doctorId,
      page,
      limit,
      patientId: query.patientId,
      courseId: query.courseId,
      clinicId: query.clinicId,
      visitDateFrom,
      visitDateTo,
      notes: query.notes,
      sortBy: query.sortBy || 'visitDate',
      sortOrder: query.sortOrder || 'desc',
    });

    return {
      visits: result.visits.map(visitToDto),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}


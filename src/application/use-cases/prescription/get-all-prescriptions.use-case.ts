import { injectable, inject } from 'tsyringe';
import { IPrescriptionRepository } from '../../../domain/repositories/prescription.repository';
import { GetPrescriptionsQueryDto, PaginatedPrescriptionsResponseDto } from '../../../presentation/dto/prescription.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { prescriptionToDto } from '../../mappers/prescription.mapper';

@injectable()
export class GetAllPrescriptionsUseCase {
  constructor(
    @inject('IPrescriptionRepository') private readonly prescriptionRepository: IPrescriptionRepository
  ) {}

  async execute(doctorId: string, query: GetPrescriptionsQueryDto): Promise<PaginatedPrescriptionsResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;

    if (dateFrom && isNaN(dateFrom.getTime())) {
      throw new ValidationError('Invalid dateFrom format');
    }
    if (dateTo && isNaN(dateTo.getTime())) {
      throw new ValidationError('Invalid dateTo format');
    }

    const result = await this.prescriptionRepository.findPaginated({
      doctorId,
      page,
      limit,
      patientId: query.patientId,
      visitId: query.visitId,
      clinicId: query.clinicId,
      dateFrom,
      dateTo,
      medicineName: query.medicineName,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    });

    return {
      prescriptions: result.prescriptions.map(prescriptionToDto),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}


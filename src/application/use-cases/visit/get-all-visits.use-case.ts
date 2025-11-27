import { injectable, inject } from 'tsyringe';
import { IVisitRepository } from '../../../domain/repositories/visit.repository';
import { IPrescriptionRepository } from '../../../domain/repositories/prescription.repository';
import { IMediaRepository } from '../../../domain/repositories/media.repository';
import { GetVisitsQueryDto, PaginatedVisitsResponseDto } from '../../../presentation/dto/visit.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { visitToDto } from '../../mappers/visit.mapper';

@injectable()
export class GetAllVisitsUseCase {
  constructor(
    @inject('IVisitRepository') private readonly visitRepository: IVisitRepository,
    @inject('IPrescriptionRepository') private readonly prescriptionRepository: IPrescriptionRepository,
    @inject('IMediaRepository') private readonly mediaRepository: IMediaRepository
  ) {}

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

    const includeOptions = this.parseIncludeOptions(query.include);
    
    const prescriptionIds = includeOptions.prescription
      ? result.visits.map((v) => v.prescriptionId).filter((id): id is string => !!id)
      : [];
    
    const visitIds = includeOptions.media
      ? result.visits.map((v) => v.id)
      : [];

    const prescriptionsMap = new Map<string, any>();
    if (includeOptions.prescription && prescriptionIds.length > 0) {
      const prescriptions = await Promise.all(
        prescriptionIds.map(async (id) => {
          try {
            const prescription = await this.prescriptionRepository.findById(id);
            return prescription ? { id, prescription } : null;
          } catch (error) {
            return null;
          }
        })
      );
      prescriptions.forEach((item) => {
        if (item) {
          prescriptionsMap.set(item.id, item.prescription);
        }
      });
    }

    const mediaMap = new Map<string, any[]>();
    if (includeOptions.media && visitIds.length > 0) {
      try {
        const allMedia = await this.mediaRepository.findAll();
        visitIds.forEach((visitId) => {
          const visitMedia = allMedia.filter((m) => m.visitId === visitId && !m.isDeleted);
          mediaMap.set(visitId, visitMedia);
        });
      } catch (error) {
        visitIds.forEach((visitId) => {
          mediaMap.set(visitId, []);
        });
      }
    }

    const visits = result.visits.map((visit) => {
      const prescription = includeOptions.prescription && visit.prescriptionId
        ? prescriptionsMap.get(visit.prescriptionId) || null
        : undefined;
      
      const media = includeOptions.media
        ? mediaMap.get(visit.id) || []
        : undefined;

      return visitToDto(visit, prescription, media);
    });

    return {
      visits,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  private parseIncludeOptions(include?: string): { prescription: boolean; media: boolean } {
    if (!include) {
      return { prescription: false, media: false };
    }

    const options = include.split(',').map((opt) => opt.trim().toLowerCase());
    return {
      prescription: options.includes('prescription'),
      media: options.includes('media'),
    };
  }
}


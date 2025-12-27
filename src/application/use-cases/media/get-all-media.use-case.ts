import { injectable, inject } from 'tsyringe';
import { IMediaRepository, MediaSearchOptions } from '../../../domain/repositories/media.repository';
import { GetMediaQueryDto, PaginatedMediaResponseDto } from '../../../presentation/dto/media.dto';
import { mediaToDto } from '../../mappers/media.mapper';
import { IGetAllMediaUseCase } from '../../interfaces/use-cases/media/media-use-cases.interface';

@injectable()
export class GetAllMediaUseCase implements IGetAllMediaUseCase {
  constructor(@inject('IMediaRepository') private readonly mediaRepository: IMediaRepository) {}

  async execute(doctorId: string, query: GetMediaQueryDto): Promise<PaginatedMediaResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const options: MediaSearchOptions = {
      doctorId,
      page,
      limit,
      patientId: query.patientId,
      courseId: query.courseId,
      visitId: query.visitId,
      clinicId: query.clinicId,
      type: query.type,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };

    const result = await this.mediaRepository.findPaginated(options);

    return {
      media: result.media.map((media) => mediaToDto(media)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}


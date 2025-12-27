import { injectable, inject } from 'tsyringe';
import { IMediaRepository } from '../../../domain/repositories/media.repository';
import { MediaResponseDto } from '../../../presentation/dto/media.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { mediaToDto } from '../../mappers/media.mapper';
import { IGetMediaUseCase } from '../../interfaces/use-cases/media/media-use-cases.interface';

@injectable()
export class GetMediaUseCase implements IGetMediaUseCase {
  constructor(@inject('IMediaRepository') private readonly mediaRepository: IMediaRepository) {}

  async execute(id: string, doctorId: string): Promise<MediaResponseDto> {
    if (!id || id.trim().length === 0) {
      throw new ValidationError('Media ID is required');
    }

    const media = await this.mediaRepository.findByIdAndDoctor(id.trim(), doctorId);
    if (!media) {
      throw new NotFoundError('Media', id);
    }

    return mediaToDto(media);
  }
}


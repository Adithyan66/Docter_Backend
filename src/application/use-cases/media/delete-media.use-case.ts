import { injectable, inject } from 'tsyringe';
import { IMediaRepository } from '../../../domain/repositories/media.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { IDeleteMediaUseCase } from '../../interfaces/use-cases/media/media-use-cases.interface';

@injectable()
export class DeleteMediaUseCase implements IDeleteMediaUseCase {
  constructor(@inject('IMediaRepository') private readonly mediaRepository: IMediaRepository) {}

  async execute(id: string, doctorId: string): Promise<void> {
    const media = await this.mediaRepository.findByIdAndDoctor(id, doctorId);
    if (!media) {
      throw new NotFoundError('Media', id);
    }

    const deleted = await this.mediaRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Media', id);
    }
  }
}


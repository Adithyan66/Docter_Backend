import { injectable, inject } from 'tsyringe';
import { IMediaRepository } from '../../../domain/repositories/media.repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { IDeleteMediaUseCase } from '../../interfaces/use-cases/media/media-use-cases.interface';
import { IFileStorageService } from '../../interfaces/file-storage-service.interface';

@injectable()
export class DeleteMediaUseCase implements IDeleteMediaUseCase {
  constructor(
    @inject('IMediaRepository') private readonly mediaRepository: IMediaRepository,
    @inject('IFileStorageService') private readonly fileStorageService: IFileStorageService
  ) {}

  async execute(id: string, doctorId: string): Promise<void> {
    const media = await this.mediaRepository.findByIdAndDoctor(id, doctorId);
    if (!media) {
      throw new NotFoundError('Media', id);
    }

    if (media.url) {
      try {
        const fileKey = this.fileStorageService.extractKeyFromUrl(media.url);
        await this.fileStorageService.deleteFile(fileKey);
      } catch (error) {
        console.error(`Failed to delete media file from cloud storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const deleted = await this.mediaRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Media', id);
    }
  }
}


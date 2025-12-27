import { Storage } from '@google-cloud/storage';
import { injectable } from 'tsyringe';
import { config } from '../../config';
import { IFileStorageService } from '../../../application/interfaces/file-storage-service.interface';

@injectable()
export class GcpStorageAdapter implements IFileStorageService {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    const storageConfig: any = {
      projectId: config.storage.gcp.projectId,
    };

    if (config.storage.gcp.keyFilename) {
      storageConfig.keyFilename = config.storage.gcp.keyFilename;
    }

    this.storage = new Storage(storageConfig);
    this.bucketName = config.storage.gcp.bucketName;
  }

  async generateUploadUrl(key: string, contentType: string): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(key);

    const [url] = await file.getSignedUrl({
      action: 'write',
      expires: Date.now() + 300 * 1000,
      contentType: contentType,
    });

    return url;
  }

  async generateDownloadUrl(key: string): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(key);

    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 300 * 1000,
    });

    return url;
  }

  async deleteFile(key: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(key);
    await file.delete();
  }

  async getPublicUrl(key: string): Promise<string> {
    return `https://storage.googleapis.com/${this.bucketName}/${key}`;
  }

  extractKeyFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      if (hostname === 'storage.googleapis.com' || hostname === 'storage.cloud.google.com') {
        const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
        if (pathParts.length >= 2) {
          return pathParts.slice(1).join('/');
        }
        return pathParts[0] || '';
      }

      const pathname = urlObj.pathname;
      return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    } catch (error) {
      throw new Error(`Invalid image URL format: ${url}`);
    }
  }
}


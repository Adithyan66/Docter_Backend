import { injectable, inject } from 'tsyringe';
import { AwsClient } from 'aws4fetch';
import { IFileStorageService } from '../../../application/interfaces/file-storage-service.interface';
import { Env } from '../env';

const UPLOAD_URL_TTL = 300;
const DOWNLOAD_URL_TTL = 300;

@injectable()
export class R2StorageAdapter implements IFileStorageService {
  private readonly bucket: R2Bucket;
  private readonly accountId: string;
  private readonly bucketName: string;
  private readonly publicBaseUrl?: string;
  private readonly aws?: AwsClient;

  constructor(@inject('Env') env: Env) {
    this.bucket = env.MEDIA;
    this.accountId = env.R2_ACCOUNT_ID || '';
    this.bucketName = env.R2_BUCKET_NAME || 'doctor-media';
    this.publicBaseUrl = env.R2_PUBLIC_BASE_URL;
    if (env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY) {
      this.aws = new AwsClient({
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        service: 's3',
        region: 'auto',
      });
    }
  }

  private objectEndpoint(key: string): string {
    return `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucketName}/${encodeURIComponent(key).replace(/%2F/g, '/')}`;
  }

  private ensureSigner(): AwsClient {
    if (!this.aws || !this.accountId) {
      throw new Error('R2 presigning is not configured (missing R2_ACCOUNT_ID / access keys)');
    }
    return this.aws;
  }

  async generateUploadUrl(key: string, contentType: string): Promise<string> {
    const url = new URL(this.objectEndpoint(key));
    url.searchParams.set('X-Amz-Expires', String(UPLOAD_URL_TTL));
    const signed = await this.ensureSigner().sign(
      new Request(url.toString(), { method: 'PUT', headers: { 'content-type': contentType } }),
      { aws: { signQuery: true } }
    );
    return signed.url;
  }

  async generateDownloadUrl(key: string): Promise<string> {
    const url = new URL(this.objectEndpoint(key));
    url.searchParams.set('X-Amz-Expires', String(DOWNLOAD_URL_TTL));
    const signed = await this.ensureSigner().sign(
      new Request(url.toString(), { method: 'GET' }),
      { aws: { signQuery: true } }
    );
    return signed.url;
  }

  async deleteFile(key: string): Promise<void> {
    await this.bucket.delete(key);
  }

  async getPublicUrl(key: string): Promise<string> {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }
    return `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucketName}/${key}`;
  }

  extractKeyFromUrl(url: string): string {
    try {
      const parsed = new URL(url);
      if (this.publicBaseUrl && url.startsWith(this.publicBaseUrl)) {
        return decodeURIComponent(parsed.pathname.replace(/^\//, ''));
      }
      const parts = parsed.pathname.split('/').filter((p) => p.length > 0);
      // r2.cloudflarestorage.com/<bucket>/<key...> -> drop the bucket segment
      if (parsed.hostname.endsWith('r2.cloudflarestorage.com') && parts.length >= 2) {
        return decodeURIComponent(parts.slice(1).join('/'));
      }
      return decodeURIComponent(parts.join('/'));
    } catch {
      throw new Error(`Invalid image URL format: ${url}`);
    }
  }
}

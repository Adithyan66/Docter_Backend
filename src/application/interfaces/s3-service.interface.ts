export interface IS3Service {
  generatePresignedUrl(key: string, contentType: string): Promise<string>;
  deleteObject(key: string): Promise<void>;
  getPublicUrl(key: string): string;
  extractS3KeyFromUrl(url: string): string;
}


export interface IFileStorageService {
  generateUploadUrl(key: string, contentType: string): Promise<string>;
  generateDownloadUrl(key: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
  getPublicUrl(key: string): Promise<string>;
  extractKeyFromUrl(url: string): string;
}


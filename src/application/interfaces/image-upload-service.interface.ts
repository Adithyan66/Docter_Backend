export interface IImageUploadService {
  generateUploadUrl(type: string, fileExtension: string): Promise<{ uploadUrl: string; publicUrl: string; key: string }>;
}


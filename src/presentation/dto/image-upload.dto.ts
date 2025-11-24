export interface GenerateUploadUrlDto {
  fileExtension: string;
}

export interface UploadUrlResponseDto {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}


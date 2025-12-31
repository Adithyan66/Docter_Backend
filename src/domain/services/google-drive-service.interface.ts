export interface IGoogleDriveService {
  ensureFolderExists(folderName: string, parentFolderId?: string): Promise<string>;
  uploadFile(filePath: string, fileName: string, folderId: string): Promise<void>;
  getRootFolderId(): Promise<string>;
}


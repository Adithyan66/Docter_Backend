export interface BackupResult {
  backupFileName: string;
  fileSizeMB: number;
  timestamp: Date;
}

export interface IExecuteBackupUseCase {
  execute(): Promise<BackupResult>;
}


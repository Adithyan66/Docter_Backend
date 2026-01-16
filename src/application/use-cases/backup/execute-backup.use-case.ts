import { injectable, inject } from 'tsyringe';
import { IExecuteBackupUseCase, BackupResult } from '../../interfaces/use-cases/backup/backup-use-cases.interface';
import { IBackupService } from '../../../domain/services/backup-service.interface';
import { IGoogleDriveService } from '../../../domain/services/google-drive-service.interface';
import { stat } from 'fs/promises';

@injectable()
export class ExecuteBackupUseCase implements IExecuteBackupUseCase {
  constructor(
    @inject('IBackupService') private backupService: IBackupService,
    @inject('IGoogleDriveService') private googleDriveService: IGoogleDriveService
  ) { }


  async execute(): Promise<BackupResult> {
    const timestamp = new Date();
    const backupFileName = `backup-${timestamp.toISOString().replace(/[:.]/g, '-')}.tar.gz`;
    let dumpPath: string | null = null;
    let compressedPath: string | null = null;

    try {
      console.log(`[Backup] Starting MongoDB backup at ${timestamp.toISOString()}`);

      dumpPath = await this.backupService.createMongoDump();
      console.log(`[Backup] MongoDB dump created: ${dumpPath}`);

      compressedPath = await this.backupService.compressDump(dumpPath);
      await this.validateBackupFile(compressedPath);

      const stats = await stat(compressedPath);
      const fileSizeMB = stats.size / 1024 / 1024;
      console.log(`[Backup] Compressed: ${compressedPath} (${fileSizeMB.toFixed(2)} MB)`);

      const rootFolderId = await this.googleDriveService.getRootFolderId();
      const monthFolder = timestamp.toISOString().slice(0, 7);
      const monthFolderId = await this.googleDriveService.ensureFolderExists(monthFolder, rootFolderId);

      await this.googleDriveService.uploadFile(compressedPath, backupFileName, monthFolderId);

      console.log(`[Backup] ✅ SUCCESS: ${backupFileName}`);

      return {
        backupFileName,
        fileSizeMB,
        timestamp,
      };
    } catch (error) {
      console.error(`[Backup] ❌ FAILED:`, error);
      throw error;
    } finally {
      if (dumpPath) await this.safeCleanup(dumpPath);
      if (compressedPath && compressedPath !== dumpPath) await this.safeCleanup(compressedPath);
    }
  }

  // ADD THESE METHODS
  private async validateBackupFile(filePath: string): Promise<void> {
    const stats = await stat(filePath);
    const sizeKB = stats.size / 1024;

    // Allow small dev DBs, flag suspiciously empty ones
    if (sizeKB < 1) {  
      throw new Error(`Backup empty (${sizeKB.toFixed(1)}KB) - mongodump failed`);
    }

    if (sizeKB < 10) {
      console.warn(`[Backup] Small database detected (${sizeKB.toFixed(1)}KB) - proceeding`);
    }

    // Verify tar structure
    const { execSync } = await import('child_process');
    execSync(`tar -tf "${filePath}" >/dev/null 2>&1`, { stdio: 'ignore' });
  }


  private async safeCleanup(path: string): Promise<void> {
    try {
      await this.backupService.cleanup(path);
    } catch (e) {
      console.warn(`[Backup] Cleanup failed (non-critical): ${path}`);
    }
  }

}


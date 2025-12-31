import { injectable, inject } from 'tsyringe';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { dirname, basename } from 'path'; 
import { IBackupService } from '../../domain/services/backup-service.interface';
import { config } from '../config';

const execAsync = promisify(exec);

@injectable()
export class MongoDbDumpService implements IBackupService {
  private tempDir: string;

  constructor() {
    this.tempDir = process.env.BACKUP_TEMP_DIR || './backups';
    if (!existsSync(this.tempDir)) {
      mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async createMongoDump(): Promise<string> {
    const timestamp = Date.now();
    const useDirectArchive = process.env.BACKUP_USE_DIRECT_ARCHIVE !== 'false';

    if (useDirectArchive) {
      return this.createMongoDumpDirect(timestamp);
    }

    return this.createMongoDumpLegacy(timestamp);
  }

  private async createMongoDumpDirect(timestamp: number): Promise<string> {
    const compressedPath = join(this.tempDir, `backup-${timestamp}.tar.gz`);

    try {
      const mongoUri = config.mongoUri;
      const mongodumpCommand = `mongodump --uri="${mongoUri}" --archive="${compressedPath}" --gzip`;

      await execAsync(mongodumpCommand);

      if (!existsSync(compressedPath)) {
        throw new Error(`MongoDB dump archive was not created: ${compressedPath}`);
      }

      return compressedPath;
    } catch (error: any) {
      if (existsSync(compressedPath)) {
        rmSync(compressedPath, { recursive: true, force: true });
      }
      throw new Error(`Failed to create MongoDB dump: ${error.message}`);
    }
  }

  private async createMongoDumpLegacy(timestamp: number): Promise<string> {
    const dumpDir = join(this.tempDir, `dump-${timestamp}`);

    try {
      const mongoUri = config.mongoUri;
      const dbName = this.extractDatabaseName(mongoUri);

      const mongodumpCommand = `mongodump --uri="${mongoUri}" --out="${dumpDir}"`;

      await execAsync(mongodumpCommand);

      if (!existsSync(dumpDir)) {
        throw new Error(`MongoDB dump directory was not created: ${dumpDir}`);
      }

      const dbDumpPath = join(dumpDir, dbName);
      if (!existsSync(dbDumpPath)) {
        throw new Error(`Database dump directory was not created: ${dbDumpPath}`);
      }

      return dumpDir;
    } catch (error: any) {
      if (existsSync(dumpDir)) {
        rmSync(dumpDir, { recursive: true, force: true });
      }
      throw new Error(`Failed to create MongoDB dump: ${error.message}`);
    }
  }


async compressDump(dumpPath: string): Promise<string> {
  if (dumpPath.endsWith('.tar.gz')) {
    return dumpPath;
  }

  const timestamp = Date.now();
  const compressedPath = join(this.tempDir, `backup-${timestamp}.tar.gz`);
  const { execSync } = await import('child_process');

  try {
    // ✅ FIXED: Use dirname/basename properly
    execSync(`tar -czf "${compressedPath}" -C "${dirname(dumpPath)}" "${basename(dumpPath)}"`, { stdio: 'inherit' });
    
    if (!existsSync(compressedPath)) {
      throw new Error('Tar compression failed');
    }
    return compressedPath;
  } catch (error: any) {
    if (existsSync(compressedPath)) rmSync(compressedPath, { force: true });
    throw new Error(`Compression failed: ${error.message}`);
  }
}


  async cleanup(path: string): Promise<void> {
    try {
      if (existsSync(path)) {
        rmSync(path, { recursive: true, force: true });
      }
    } catch (error: any) {
      throw new Error(`Failed to cleanup path ${path}: ${error.message}`);
    }
  }

  private extractDatabaseName(uri: string): string {
    try {
      const url = new URL(uri);
      const pathname = url.pathname;
      if (pathname && pathname.length > 1) {
        return pathname.substring(1).split('/')[0];
      }
      return 'test';
    } catch (error) {
      const match = uri.match(/\/([^/?]+)/);
      if (match && match[1]) {
        return match[1];
      }
      return 'test';
    }
  }
}


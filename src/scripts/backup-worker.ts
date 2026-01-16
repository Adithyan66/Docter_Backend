import 'reflect-metadata';
import '../di/container';
import { container } from '../di/container';
import { connectDatabase } from '../infrastructure/database/connection';
import { disconnectDatabase } from '../infrastructure/database/connection';
import { IExecuteBackupUseCase } from '../application/interfaces/use-cases/backup/backup-use-cases.interface';
import { EmailNotificationService } from '../infrastructure/shared/email-notification.service';
import { stat } from 'fs/promises';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 60000;

const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const executeBackupWithRetry = async (
  executeBackupUseCase: IExecuteBackupUseCase,
  emailService: EmailNotificationService,
  attempt: number = 1
): Promise<void> => {
  const timestamp = new Date();
  
  try {
    console.log(`[Backup Worker] Starting backup attempt ${attempt}/${MAX_RETRIES} at ${timestamp.toISOString()}`);
    
    const result = await executeBackupUseCase.execute();
    
    console.log(`[Backup Worker] ✅ Backup completed successfully`);
    
    await emailService.sendBackupSuccessNotification(
      result.backupFileName,
      result.fileSizeMB,
      result.timestamp
    );
    
    process.exit(0);
  } catch (error: any) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[Backup Worker] ❌ Backup failed (attempt ${attempt}/${MAX_RETRIES}):`, err.message);
    
    if (err.stack) {
      console.error(`[Backup Worker] Stack trace:`, err.stack);
    }
    
    await emailService.sendBackupFailureNotification(err, attempt, MAX_RETRIES, timestamp);
    
    if (attempt < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
      console.log(`[Backup Worker] Retrying in ${delay / 1000} seconds...`);
      await sleep(delay);
      return executeBackupWithRetry(executeBackupUseCase, emailService, attempt + 1);
    } else {
      console.error(`[Backup Worker] ❌ All ${MAX_RETRIES} backup attempts failed`);
      process.exit(1);
    }
  }
};

const main = async (): Promise<void> => {
  try {
    await connectDatabase();
    console.log('[Backup Worker] Database connected');
    
    const executeBackupUseCase = container.resolve<IExecuteBackupUseCase>('IExecuteBackupUseCase');
    const emailService = new EmailNotificationService();
    
    await executeBackupWithRetry(executeBackupUseCase, emailService);
  } catch (error: any) {
    console.error('[Backup Worker] Fatal error:', error);
    process.exit(1);
  } finally {
    try {
      await disconnectDatabase();
    } catch (error) {
      console.error('[Backup Worker] Error disconnecting database:', error);
    }
  }
};

main();


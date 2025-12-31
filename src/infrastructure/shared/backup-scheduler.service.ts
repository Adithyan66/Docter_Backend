import { injectable } from 'tsyringe';
import * as cron from 'node-cron';
import { ISchedulerService } from '../../domain/services/scheduler-service.interface';

@injectable()
export class BackupSchedulerService implements ISchedulerService {
  private tasks: Map<string, cron.ScheduledTask> = new Map();
  private isRunning: boolean = false;
  private currentBackup: Promise<void> | null = null;
  private readonly backupTimeout: number = parseInt(process.env.BACKUP_TIMEOUT_MS || '3600000', 10);

  schedule(cronExpression: string, task: () => Promise<void>): void {
    if (this.tasks.has(cronExpression)) {
      throw new Error(`Task with cron expression ${cronExpression} already exists`);
    }

    const scheduledTask = cron.schedule(cronExpression, async () => {
      if (this.isRunning) {
        console.warn(`[Scheduler] Backup already running, skipping this execution`);
        return;
      }

      this.isRunning = true;
      const timeoutId = setTimeout(() => {
        console.error(`[Scheduler] Backup timeout after ${this.backupTimeout / 1000 / 60} minutes`);
        this.isRunning = false;
        this.currentBackup = null;
      }, this.backupTimeout);

      try {
        this.currentBackup = task();
        await this.currentBackup;
      } catch (error) {
        console.error(`[Scheduler] Task execution failed:`, error);
      } finally {
        clearTimeout(timeoutId);
        this.isRunning = false;
        this.currentBackup = null;
      }
    }, {
      timezone: 'UTC'
    });
    
    scheduledTask.stop();

    this.tasks.set(cronExpression, scheduledTask);
  }

  start(): void {
    this.tasks.forEach((task, expression) => {
      task.start();
      console.log(`[Scheduler] Started cron job with expression: ${expression}`);
    });
  }

  stop(): void {
    this.tasks.forEach((task, expression) => {
      task.stop();
      console.log(`[Scheduler] Stopped cron job with expression: ${expression}`);
    });
  }
}


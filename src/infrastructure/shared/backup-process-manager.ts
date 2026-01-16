import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { config } from '../config';

export class BackupProcessManager {
  private currentProcess: ChildProcess | null = null;
  private isRunning: boolean = false;

  async spawnBackup(): Promise<void> {
    if (this.isRunning) {
      console.log('[Backup Manager] Backup is already running, skipping...');
      return;
    }

    this.isRunning = true;
    const isProduction = config.nodeEnv === 'production';
    const workerPath = isProduction
      ? join(process.cwd(), 'dist', 'scripts', 'backup-worker.js')
      : join(process.cwd(), 'src', 'scripts', 'backup-worker.ts');

    const command = isProduction ? 'node' : 'ts-node';
    const args = isProduction ? [workerPath] : ['--transpile-only', workerPath];

    console.log(`[Backup Manager] Spawning backup process: ${command} ${args.join(' ')}`);

    this.currentProcess = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    });

    this.currentProcess.stdout?.on('data', (data: Buffer) => {
      process.stdout.write(`[Backup] ${data}`);
    });

    this.currentProcess.stderr?.on('data', (data: Buffer) => {
      process.stderr.write(`[Backup] ${data}`);
    });

    this.currentProcess.on('exit', (code: number | null, signal: string | null) => {
      this.isRunning = false;
      this.currentProcess = null;
      
      if (code === 0) {
        console.log('[Backup Manager] Backup process completed successfully');
      } else {
        console.error(`[Backup Manager] Backup process exited with code ${code}${signal ? ` and signal ${signal}` : ''}`);
      }
    });

    this.currentProcess.on('error', (error: Error) => {
      this.isRunning = false;
      this.currentProcess = null;
      console.error('[Backup Manager] Failed to spawn backup process:', error.message);
    });
  }

  isBackupRunning(): boolean {
    return this.isRunning;
  }

  async waitForCompletion(): Promise<void> {
    if (!this.currentProcess) {
      return;
    }

    return new Promise((resolve) => {
      if (!this.currentProcess) {
        resolve();
        return;
      }

      const onExit = () => {
        this.currentProcess?.removeListener('exit', onExit);
        this.currentProcess?.removeListener('error', onExit);
        resolve();
      };

      this.currentProcess.on('exit', onExit);
      this.currentProcess.on('error', onExit);
    });
  }
}


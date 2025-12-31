import 'reflect-metadata';
import './di/container';
import { container } from './di/container';
import { connectDatabase } from './infrastructure/database/connection';
import { config } from './infrastructure/config';
import { createExpressApp } from './presentation/adapters/express/express-app.factory';
import { errorHandler } from './infrastructure/errors/error-handler';
import { notFoundHandler } from './infrastructure/errors/not-found-handler';
import { setupRoutes } from './presentation/routes';
import { ISchedulerService } from './domain/services/scheduler-service.interface';
import { IExecuteBackupUseCase } from './application/interfaces/use-cases/backup/backup-use-cases.interface';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const schedulerService = container.resolve<ISchedulerService>('ISchedulerService');
    const executeBackupUseCase = container.resolve<IExecuteBackupUseCase>('IExecuteBackupUseCase');

    schedulerService.schedule(config.backup.cronSchedule, async () => {
      await executeBackupUseCase.execute();
    });

    schedulerService.start();
    console.log(`[Backup] Backup scheduler started with schedule: ${config.backup.cronSchedule}`);

    const app = createExpressApp({
      routes: (router) => {
        setupRoutes(router);
      },
      notFoundHandler,
      errorHandler,
    });

    const port = config.port;

    app.listen(port, () => {
      console.log(`Server running on port ${port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

import 'reflect-metadata';
import './di/container';
import { connectDatabase } from './infrastructure/database/connection';
import { config } from './infrastructure/config';
import { createExpressApp } from './presentation/adapters/express/express-app.factory';
import { errorHandler } from './infrastructure/errors/error-handler';
import { notFoundHandler } from './infrastructure/errors/not-found-handler';
import { setupRoutes } from './presentation/routes';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

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

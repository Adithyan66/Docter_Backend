"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("./di/container");
const container_1 = require("./di/container");
const connection_1 = require("./infrastructure/database/connection");
const config_1 = require("./infrastructure/config");
const express_app_factory_1 = require("./presentation/adapters/express/express-app.factory");
const error_handler_1 = require("./infrastructure/errors/error-handler");
const not_found_handler_1 = require("./infrastructure/errors/not-found-handler");
const routes_1 = require("./presentation/routes");
const startServer = async () => {
    try {
        await (0, connection_1.connectDatabase)();
        const schedulerService = container_1.container.resolve('ISchedulerService');
        const executeBackupUseCase = container_1.container.resolve('IExecuteBackupUseCase');
        schedulerService.schedule(config_1.config.backup.cronSchedule, async () => {
            await executeBackupUseCase.execute();
        });
        schedulerService.start();
        console.log(`[Backup] Backup scheduler started with schedule: ${config_1.config.backup.cronSchedule}`);
        const app = (0, express_app_factory_1.createExpressApp)({
            routes: (router) => {
                (0, routes_1.setupRoutes)(router);
            },
            notFoundHandler: not_found_handler_1.notFoundHandler,
            errorHandler: error_handler_1.errorHandler,
        });
        const port = config_1.config.port;
        app.listen(port, () => {
            console.log(`Server running on port ${port} in ${config_1.config.nodeEnv} mode`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

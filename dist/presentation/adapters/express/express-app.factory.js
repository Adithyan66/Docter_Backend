"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExpressApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = require("../../../infrastructure/config");
const express_router_adapter_1 = require("./express-router.adapter");
const express_middleware_adapter_1 = require("./express-middleware.adapter");
const createExpressApp = (config) => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: config_1.config.corsOrigin || '*', credentials: true }));
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.json());
    app.use((err, req, res, next) => {
        if (err instanceof SyntaxError && 'body' in err) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid JSON in request body'
                },
                timestamp: new Date().toISOString()
            });
            return;
        }
        next(err);
    });
    app.use(express_1.default.urlencoded({ extended: true }));
    app.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    if (config.routes) {
        const expressRouter = express_1.default.Router();
        const router = new express_router_adapter_1.ExpressRouterAdapter(expressRouter);
        config.routes(router);
        app.use('/api', expressRouter);
    }
    if (config.notFoundHandler) {
        app.use((0, express_middleware_adapter_1.adaptMiddleware)(config.notFoundHandler));
    }
    if (config.errorHandler) {
        app.use((0, express_middleware_adapter_1.adaptMiddleware)(config.errorHandler));
    }
    return app;
};
exports.createExpressApp = createExpressApp;

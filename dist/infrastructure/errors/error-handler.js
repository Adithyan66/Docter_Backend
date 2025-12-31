"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const mongoose_1 = require("mongoose");
const base_error_1 = require("../../domain/errors/base.error");
const constants_1 = require("../constants");
const mongoose_error_handler_1 = require("./mongoose-error-handler");
const express_error_handler_1 = require("./express-error-handler");
const config_1 = require("../config");
const logError = (error, req, code, statusCode) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const path = req.path;
    console.error(`[${timestamp}] Error: ${error.message}`);
    console.error(`  Code: ${code}`);
    console.error(`  Status: ${statusCode}`);
    console.error(`  Method: ${method}`);
    console.error(`  Path: ${path}`);
    if (config_1.config.nodeEnv === 'development' && error.stack) {
        console.error(`  Stack: ${error.stack}`);
    }
};
const errorHandler = (err, req, res, next) => {
    let error = err;
    let code = constants_1.ErrorCodes.INTERNAL_SERVER_ERROR;
    let statusCode = constants_1.HttpStatus.INTERNAL_SERVER_ERROR;
    let message = constants_1.ServerErrors.INTERNAL_SERVER_ERROR;
    if (err instanceof base_error_1.DomainError) {
        code = err.code;
        statusCode = err.statusCode;
        message = err.message;
        logError(err, req, code, statusCode);
        (0, constants_1.errorResponse)(res, code, message, statusCode);
        return;
    }
    if (err instanceof mongoose_1.Error || err.name?.includes('Mongo')) {
        error = (0, mongoose_error_handler_1.handleMongooseError)(err);
        if (error instanceof base_error_1.DomainError) {
            code = error.code;
            statusCode = error.statusCode;
            message = error.message;
            logError(error, req, code, statusCode);
            (0, constants_1.errorResponse)(res, code, message, statusCode);
            return;
        }
    }
    if (err.name === 'SyntaxError' || err.name === 'MulterError') {
        error = (0, express_error_handler_1.handleExpressError)(err);
        if (error instanceof base_error_1.DomainError) {
            code = error.code;
            statusCode = error.statusCode;
            message = error.message;
            logError(error, req, code, statusCode);
            (0, constants_1.errorResponse)(res, code, message, statusCode);
            return;
        }
    }
    logError(error, req, code, statusCode);
    (0, constants_1.errorResponse)(res, code, message, statusCode);
};
exports.errorHandler = errorHandler;

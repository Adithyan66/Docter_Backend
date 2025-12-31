"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginatedResponse = exports.errorResponse = exports.successResponse = void 0;
const status_codes_1 = require("./status-codes");
const successResponse = (res, data, statusCode = status_codes_1.HttpStatus.OK, message) => {
    const response = {
        success: true,
        data,
        timestamp: new Date().toISOString(),
    };
    if (message) {
        response.message = message;
    }
    return res.status(statusCode).json(response);
};
exports.successResponse = successResponse;
const errorResponse = (res, code, message, statusCode = status_codes_1.HttpStatus.INTERNAL_SERVER_ERROR) => {
    const response = {
        success: false,
        error: {
            code,
            message,
        },
        timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
};
exports.errorResponse = errorResponse;
const paginatedResponse = (res, data, pagination, message) => {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    const response = {
        success: true,
        data,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages,
        },
        timestamp: new Date().toISOString(),
    };
    if (message) {
        response.message = message;
    }
    return res.status(status_codes_1.HttpStatus.OK).json(response);
};
exports.paginatedResponse = paginatedResponse;

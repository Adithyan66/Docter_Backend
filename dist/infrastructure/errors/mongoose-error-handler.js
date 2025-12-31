"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMongooseError = void 0;
const validation_error_1 = require("../../domain/errors/validation.error");
const conflict_error_1 = require("../../domain/errors/conflict.error");
const not_found_error_1 = require("../../domain/errors/not-found.error");
const constants_1 = require("../constants");
const handleMongooseError = (error) => {
    if (error.name === 'ValidationError') {
        const validationError = error;
        const messages = Object.values(validationError.errors).map((err) => err.message);
        return new validation_error_1.ValidationError(messages.join(', ') || constants_1.ValidationErrors.INVALID_INPUT);
    }
    if (error.name === 'CastError') {
        const castError = error;
        return new validation_error_1.ValidationError(`Invalid ${castError.kind} value for field ${castError.path}: ${castError.value}`);
    }
    if (error.name === 'MongoServerError') {
        const mongoError = error;
        if (mongoError.code === 11000) {
            const field = Object.keys(mongoError.keyPattern || {})[0] || 'field';
            const value = mongoError.keyValue?.[field] || '';
            return new conflict_error_1.ConflictError(field === 'email'
                ? constants_1.ConflictErrors.EMAIL_ALREADY_EXISTS
                : `${field} with value ${value} already exists`);
        }
        if (mongoError.code === 11001) {
            return new conflict_error_1.ConflictError(constants_1.ConflictErrors.DUPLICATE_ENTRY);
        }
    }
    if (error.name === 'DocumentNotFoundError') {
        return new not_found_error_1.NotFoundError('Document', '');
    }
    return error;
};
exports.handleMongooseError = handleMongooseError;

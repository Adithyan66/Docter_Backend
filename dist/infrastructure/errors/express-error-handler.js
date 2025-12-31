"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleExpressError = void 0;
const validation_error_1 = require("../../domain/errors/validation.error");
const constants_1 = require("../constants");
const handleExpressError = (error) => {
    if (error.name === 'SyntaxError' && 'body' in error) {
        return new validation_error_1.ValidationError(constants_1.ValidationErrors.INVALID_INPUT);
    }
    if (error.name === 'MulterError') {
        return new validation_error_1.ValidationError('File upload error');
    }
    return error;
};
exports.handleExpressError = handleExpressError;

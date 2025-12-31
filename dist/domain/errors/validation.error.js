"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
const base_error_1 = require("./base.error");
const constants_1 = require("../../infrastructure/constants");
class ValidationError extends base_error_1.DomainError {
    constructor(message) {
        super(message);
        this.code = constants_1.ErrorCodes.VALIDATION_ERROR;
        this.statusCode = constants_1.HttpStatus.BAD_REQUEST;
    }
}
exports.ValidationError = ValidationError;

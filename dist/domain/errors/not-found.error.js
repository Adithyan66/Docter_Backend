"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
const base_error_1 = require("./base.error");
const constants_1 = require("../../infrastructure/constants");
class NotFoundError extends base_error_1.DomainError {
    constructor(resource, identifier) {
        super(identifier
            ? `${resource} with identifier ${identifier} not found`
            : constants_1.NotFoundErrors.RECORD_NOT_FOUND(resource));
        this.code = constants_1.ErrorCodes.NOT_FOUND;
        this.statusCode = constants_1.HttpStatus.NOT_FOUND;
    }
}
exports.NotFoundError = NotFoundError;

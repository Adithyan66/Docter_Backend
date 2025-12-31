"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = void 0;
const base_error_1 = require("./base.error");
const constants_1 = require("../../infrastructure/constants");
class ConflictError extends base_error_1.DomainError {
    constructor(message) {
        super(message);
        this.code = constants_1.ErrorCodes.CONFLICT;
        this.statusCode = constants_1.HttpStatus.CONFLICT;
    }
}
exports.ConflictError = ConflictError;

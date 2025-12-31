"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = void 0;
const base_error_1 = require("./base.error");
const constants_1 = require("../../infrastructure/constants");
class UnauthorizedError extends base_error_1.DomainError {
    constructor(message) {
        super(message);
        this.code = constants_1.ErrorCodes.UNAUTHORIZED;
        this.statusCode = constants_1.HttpStatus.UNAUTHORIZED;
    }
}
exports.UnauthorizedError = UnauthorizedError;

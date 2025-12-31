"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestError = void 0;
const base_error_1 = require("./base.error");
const constants_1 = require("../../infrastructure/constants");
class BadRequestError extends base_error_1.DomainError {
    constructor(message) {
        super(message);
        this.code = constants_1.ErrorCodes.BAD_REQUEST;
        this.statusCode = constants_1.HttpStatus.BAD_REQUEST;
    }
}
exports.BadRequestError = BadRequestError;

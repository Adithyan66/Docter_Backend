"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validation_error_1 = require("../../domain/errors/validation.error");
const validate = (schema) => {
    return (req, _res, next) => {
        try {
            if (req.body === undefined || req.body === null) {
                if (next) {
                    next(new validation_error_1.ValidationError('Request body is required'));
                }
                return;
            }
            schema.parse(req.body);
            if (next) {
                next();
            }
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const message = error.issues.map((issue) => issue.message).join(', ');
                if (next) {
                    next(new validation_error_1.ValidationError(message));
                }
                return;
            }
            if (next && error instanceof Error) {
                next(error);
            }
        }
    };
};
exports.validate = validate;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodes = exports.BusinessLogicErrors = exports.ServerErrors = exports.ConflictErrors = exports.AuthorizationErrors = exports.AuthenticationErrors = exports.NotFoundErrors = exports.ValidationErrors = void 0;
exports.ValidationErrors = {
    INVALID_INPUT: 'Invalid input provided',
    MISSING_REQUIRED_FIELD: 'Required field is missing',
    INVALID_FORMAT: 'Invalid format',
    INVALID_EMAIL: 'Invalid email format',
    INVALID_PASSWORD: 'Invalid password format',
    FIELD_TOO_SHORT: (field, min) => `${field} must be at least ${min} characters`,
    FIELD_TOO_LONG: (field, max) => `${field} must be at most ${max} characters`,
    INVALID_RANGE: (field, min, max) => `${field} must be between ${min} and ${max}`,
};
exports.NotFoundErrors = {
    RESOURCE_NOT_FOUND: 'Resource not found',
    USER_NOT_FOUND: 'User not found',
    RECORD_NOT_FOUND: (resource) => `${resource} not found`,
    ROUTE_NOT_FOUND: (method, path) => `Route ${method} ${path} not found`,
};
exports.AuthenticationErrors = {
    UNAUTHORIZED: 'Unauthorized access',
    INVALID_CREDENTIALS: 'Invalid credentials',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    TOKEN_MISSING: 'Token is missing',
    SESSION_EXPIRED: 'Session has expired',
    INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
};
exports.AuthorizationErrors = {
    FORBIDDEN: 'Access forbidden',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
    ROLE_REQUIRED: (role) => `${role} role required`,
};
exports.ConflictErrors = {
    RESOURCE_EXISTS: 'Resource already exists',
    DUPLICATE_ENTRY: 'Duplicate entry',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
    USERNAME_ALREADY_EXISTS: 'Username already exists',
};
exports.ServerErrors = {
    INTERNAL_SERVER_ERROR: 'An unexpected error occurred',
    DATABASE_ERROR: 'Database operation failed',
    EXTERNAL_SERVICE_ERROR: 'External service error',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
    BAD_GATEWAY: 'Bad gateway',
};
exports.BusinessLogicErrors = {
    INVALID_OPERATION: 'Invalid operation',
    OPERATION_NOT_ALLOWED: 'Operation not allowed',
    RESOURCE_IN_USE: 'Resource is currently in use',
    INVALID_STATE: 'Invalid state',
    PRECONDITION_FAILED: 'Precondition failed',
};
exports.ErrorCodes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    BAD_REQUEST: 'BAD_REQUEST',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    CONFLICT: 'CONFLICT',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
    BUSINESS_LOGIC_ERROR: 'BUSINESS_LOGIC_ERROR',
};

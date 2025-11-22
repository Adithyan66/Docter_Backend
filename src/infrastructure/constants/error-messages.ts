export const ValidationErrors = {
  INVALID_INPUT: 'Invalid input provided',
  MISSING_REQUIRED_FIELD: 'Required field is missing',
  INVALID_FORMAT: 'Invalid format',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PASSWORD: 'Invalid password format',
  FIELD_TOO_SHORT: (field: string, min: number) => `${field} must be at least ${min} characters`,
  FIELD_TOO_LONG: (field: string, max: number) => `${field} must be at most ${max} characters`,
  INVALID_RANGE: (field: string, min: number, max: number) => `${field} must be between ${min} and ${max}`,
} as const;

export const NotFoundErrors = {
  RESOURCE_NOT_FOUND: 'Resource not found',
  USER_NOT_FOUND: 'User not found',
  RECORD_NOT_FOUND: (resource: string) => `${resource} not found`,
  ROUTE_NOT_FOUND: (method: string, path: string) => `Route ${method} ${path} not found`,
} as const;

export const AuthenticationErrors = {
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_CREDENTIALS: 'Invalid credentials',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  TOKEN_MISSING: 'Token is missing',
  SESSION_EXPIRED: 'Session has expired',
} as const;

export const AuthorizationErrors = {
  FORBIDDEN: 'Access forbidden',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  ROLE_REQUIRED: (role: string) => `${role} role required`,
} as const;

export const ConflictErrors = {
  RESOURCE_EXISTS: 'Resource already exists',
  DUPLICATE_ENTRY: 'Duplicate entry',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
} as const;

export const ServerErrors = {
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred',
  DATABASE_ERROR: 'Database operation failed',
  EXTERNAL_SERVICE_ERROR: 'External service error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  BAD_GATEWAY: 'Bad gateway',
} as const;

export const BusinessLogicErrors = {
  INVALID_OPERATION: 'Invalid operation',
  OPERATION_NOT_ALLOWED: 'Operation not allowed',
  RESOURCE_IN_USE: 'Resource is currently in use',
  INVALID_STATE: 'Invalid state',
  PRECONDITION_FAILED: 'Precondition failed',
} as const;

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  BUSINESS_LOGIC_ERROR: 'BUSINESS_LOGIC_ERROR',
} as const;

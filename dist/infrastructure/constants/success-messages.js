"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceMessages = exports.SuccessMessages = void 0;
exports.SuccessMessages = {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    RETRIEVED: 'Resource retrieved successfully',
    OPERATION_SUCCESS: 'Operation completed successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    REGISTRATION_SUCCESS: 'Registration successful',
    PASSWORD_RESET_SUCCESS: 'Password reset successful',
    EMAIL_VERIFIED: 'Email verified successfully',
};
exports.ResourceMessages = {
    CREATED: (resource) => `${resource} created successfully`,
    UPDATED: (resource) => `${resource} updated successfully`,
    DELETED: (resource) => `${resource} deleted successfully`,
    RETRIEVED: (resource) => `${resource} retrieved successfully`,
    LIST_RETRIEVED: (resource) => `${resource} list retrieved successfully`,
};

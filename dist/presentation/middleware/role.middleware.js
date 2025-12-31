"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireClinicAccess = exports.doctorOnly = exports.requireRole = void 0;
const unauthorized_error_1 = require("../../domain/errors/unauthorized.error");
const error_messages_1 = require("../../infrastructure/constants/error-messages");
const requireRole = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !user.role || !roles.includes(user.role)) {
            throw new unauthorized_error_1.UnauthorizedError(error_messages_1.AuthenticationErrors.UNAUTHORIZED);
        }
        if (next) {
            next();
        }
    };
};
exports.requireRole = requireRole;
exports.doctorOnly = (0, exports.requireRole)(['doctor']);
const requireClinicAccess = (paramName) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !user.role) {
            throw new unauthorized_error_1.UnauthorizedError(error_messages_1.AuthenticationErrors.UNAUTHORIZED);
        }
        if (user.role === 'staff') {
            const clinicParam = req.params[paramName];
            if (!clinicParam || clinicParam !== user.clinicId) {
                throw new unauthorized_error_1.UnauthorizedError(error_messages_1.AuthenticationErrors.UNAUTHORIZED);
            }
        }
        if (next) {
            next();
        }
    };
};
exports.requireClinicAccess = requireClinicAccess;

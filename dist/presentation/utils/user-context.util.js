"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClinicId = exports.getUserId = exports.getUserContext = void 0;
const unauthorized_error_1 = require("../../domain/errors/unauthorized.error");
const error_messages_1 = require("../../infrastructure/constants/error-messages");
const getUserContext = (req) => {
    const user = req.user;
    if (!user || !user.id || !user.role) {
        throw new unauthorized_error_1.UnauthorizedError(error_messages_1.AuthenticationErrors.UNAUTHORIZED);
    }
    if (user.role === 'staff') {
        if (!user.doctorId) {
            throw new unauthorized_error_1.UnauthorizedError(error_messages_1.AuthenticationErrors.UNAUTHORIZED);
        }
        return {
            id: user.id,
            role: user.role,
            clinicId: user.clinicId,
            doctorId: user.doctorId,
            email: user.email,
        };
    }
    return {
        id: user.id,
        role: user.role,
        clinicId: undefined,
        doctorId: user.id,
        email: user.email,
    };
};
exports.getUserContext = getUserContext;
const getUserId = (req) => {
    const context = (0, exports.getUserContext)(req);
    return context.doctorId;
};
exports.getUserId = getUserId;
const getClinicId = (req) => {
    const context = (0, exports.getUserContext)(req);
    return context.clinicId;
};
exports.getClinicId = getClinicId;

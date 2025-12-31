"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutSchema = exports.refreshTokenSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z
    .object({
    role: zod_1.z.enum(['doctor', 'staff']).optional(),
    email: zod_1.z.string().email('Invalid email format').optional(),
    username: zod_1.z.string().optional(),
    password: zod_1.z.string().min(1, 'Password is required'),
})
    .refine((data) => {
    if (data.role === 'staff') {
        return !!data.username;
    }
    return !!data.email;
}, { message: 'Email or username is required', path: ['email'] })
    .strict();
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.logoutSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});

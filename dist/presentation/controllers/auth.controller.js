"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("../../infrastructure/constants");
const validation_error_1 = require("../../domain/errors/validation.error");
const config_1 = require("../../infrastructure/config");
let AuthController = class AuthController {
    constructor(loginUseCase, refreshTokenUseCase, logoutUseCase) {
        this.loginUseCase = loginUseCase;
        this.refreshTokenUseCase = refreshTokenUseCase;
        this.logoutUseCase = logoutUseCase;
    }
    async login(req, res, next) {
        if (!req.body || typeof req.body !== 'object') {
            throw new validation_error_1.ValidationError('Request body is required');
        }
        const { email, password, role, username } = req.body;
        const result = await this.loginUseCase.execute({ role, email, username, password });
        const isProduction = config_1.config.nodeEnv === 'production';
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 15 * 60 * 1000,
        });
        (0, constants_1.successResponse)(res, result, constants_1.HttpStatus.OK, constants_1.SuccessMessages.LOGIN_SUCCESS);
    }
    async refreshToken(req, res, next) {
        if (!req.body || typeof req.body !== 'object') {
            throw new validation_error_1.ValidationError('Request body is required');
        }
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new validation_error_1.ValidationError('Refresh token is required');
        }
        const result = await this.refreshTokenUseCase.execute(refreshToken);
        const isProduction = config_1.config.nodeEnv === 'production';
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 15 * 60 * 1000,
        });
        (0, constants_1.successResponse)(res, result, constants_1.HttpStatus.OK);
    }
    async logout(req, res, next) {
        if (!req.body || typeof req.body !== 'object') {
            throw new validation_error_1.ValidationError('Request body is required');
        }
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new validation_error_1.ValidationError('Refresh token is required');
        }
        await this.logoutUseCase.execute(refreshToken);
        const isProduction = config_1.config.nodeEnv === 'production';
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
        });
        (0, constants_1.successResponse)(res, null, constants_1.HttpStatus.OK, constants_1.SuccessMessages.LOGOUT_SUCCESS);
    }
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ILoginUseCase')),
    __param(1, (0, tsyringe_1.inject)('IRefreshTokenUseCase')),
    __param(2, (0, tsyringe_1.inject)('ILogoutUseCase')),
    __metadata("design:paramtypes", [Object, Object, Object])
], AuthController);

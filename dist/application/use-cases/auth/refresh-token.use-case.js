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
exports.RefreshTokenUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const not_found_error_1 = require("../../../domain/errors/not-found.error");
const validation_error_1 = require("../../../domain/errors/validation.error");
const error_messages_1 = require("../../../infrastructure/constants/error-messages");
let RefreshTokenUseCase = class RefreshTokenUseCase {
    constructor(doctorRepository, staffRepository, jwtService) {
        this.doctorRepository = doctorRepository;
        this.staffRepository = staffRepository;
        this.jwtService = jwtService;
    }
    async execute(refreshToken) {
        let payload;
        try {
            payload = await this.jwtService.verifyRefreshToken(refreshToken);
        }
        catch (error) {
            throw new validation_error_1.ValidationError(error_messages_1.AuthenticationErrors.INVALID_REFRESH_TOKEN);
        }
        if (payload.role === 'staff') {
            const staff = await this.staffRepository.findById(payload.id);
            if (!staff) {
                throw new not_found_error_1.NotFoundError('Staff');
            }
            if (!staff.refreshToken || staff.refreshToken !== refreshToken) {
                throw new validation_error_1.ValidationError(error_messages_1.AuthenticationErrors.INVALID_REFRESH_TOKEN);
            }
            if (!staff.isActive) {
                throw new validation_error_1.ValidationError(error_messages_1.AuthenticationErrors.INVALID_REFRESH_TOKEN);
            }
            const tokenPayload = {
                id: staff.id,
                email: staff.username,
                role: 'staff',
                clinicId: staff.clinicId,
                doctorId: staff.doctorId,
            };
            const accessToken = await this.jwtService.generateAccessToken(tokenPayload);
            return { accessToken, refreshToken };
        }
        const doctor = await this.doctorRepository.findById(payload.id);
        if (!doctor) {
            throw new not_found_error_1.NotFoundError('Doctor');
        }
        if (doctor.refreshToken !== refreshToken) {
            throw new validation_error_1.ValidationError(error_messages_1.AuthenticationErrors.INVALID_REFRESH_TOKEN);
        }
        const tokenPayload = {
            id: doctor.id,
            email: doctor.email.toString(),
            role: 'doctor',
        };
        const accessToken = await this.jwtService.generateAccessToken(tokenPayload);
        return { accessToken, refreshToken };
    }
};
exports.RefreshTokenUseCase = RefreshTokenUseCase;
exports.RefreshTokenUseCase = RefreshTokenUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IDoctorRepository')),
    __param(1, (0, tsyringe_1.inject)('IStaffRepository')),
    __param(2, (0, tsyringe_1.inject)('IJwtService')),
    __metadata("design:paramtypes", [Object, Object, Object])
], RefreshTokenUseCase);
